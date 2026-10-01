<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreatePurchaseReturnRequest;
use App\Http\Requests\UpdatePurchaseReturnRequest;
use App\Http\Resources\PurchaseReturnCollection;
use App\Http\Resources\PurchaseReturnResource;
use App\Models\PurchaseReturn;
use App\Models\Role;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Repositories\PurchaseReturnRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Support\PdfLogo;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PurchaseReturnAPIController extends AppBaseController
{
    /** @var PurchaseReturnRepository */
    private $purchaseReturnRepository;

    /**
     * PurchaseReturnAPIController constructor.
     */
    public function __construct(PurchaseReturnRepository $purchaseReturnRepository)
    {
        $this->purchaseReturnRepository = $purchaseReturnRepository;
    }

    public function index(Request $request): PurchaseReturnCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        // $supplier = (Supplier::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // if(isAdmin()){
        //     $warehouse = (Warehouse::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // } else {
        //     $warehouse = (Warehouse::whereIn('id', getLoginUserWarehouseIds())->where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // }
        // $purchasesReturn = $this->purchaseReturnRepository;
        $purchasesReturn = PurchaseReturn::with(['supplier', 'warehouse', 'purchaseReturnItems'])->whereHas('supplier')->whereHas('warehouse');
        if (!isAdmin()) {
            $purchasesReturn->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }
        if (!empty($search)) {
            $purchasesReturn->where(function ($query) use ($search) {
                $query->orWhere('reference_code', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%")
                    ->orWhere('tax_rate', 'LIKE', "%{$search}%")
                    ->orWhere('tax_amount', 'LIKE', "%{$search}%")
                    ->orWhere('discount', 'LIKE', "%{$search}%")
                    ->orWhere('shipping', 'LIKE', "%{$search}%")
                    ->orWhere('grand_total', 'LIKE', "%{$search}%")
                    ->orWhere('received_amount', 'LIKE', "%{$search}%")
                    ->orWhere('paid_amount', 'LIKE', "%{$search}%")
                    ->orWhere('payment_type', 'LIKE', "%{$search}%")
                    ->orWhere('notes', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%")
                    ->orWhereHas('supplier', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('warehouse', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($request->get('start_date') && $request->get('end_date')) {
            $purchasesReturn->whereBetween(
                'date',
                [$request->get('start_date'), $request->get('end_date')]
            );
        }

        if ($request->get('warehouse_id') && $request->get('warehouse_id') != 'null' && $request->get('warehouse_id') != 'all') {
            $purchasesReturn->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('status')) {
            $purchasesReturn->where('status', $request->get('status'));
        }

        $sort = $request->get('sort');
        if ($sort) {
            $direction = 'asc';
            if (str_starts_with($sort, '-')) {
                $direction = 'desc';
                $sort = ltrim($sort, '-');
            }
            $purchasesReturn->orderBy($sort, $direction);
        } else {
            $purchasesReturn->orderBy('id', 'desc');
        }

        $purchasesReturn = $purchasesReturn->paginate($perPage);
        PurchaseReturnResource::usingWithCollection();

        return new PurchaseReturnCollection($purchasesReturn);
    }

    public function store(CreatePurchaseReturnRequest $request): PurchaseReturnResource
    {
        $input = $request->all();
        $purchaseReturn = $this->purchaseReturnRepository->storePurchaseReturn($input);

        return new PurchaseReturnResource($purchaseReturn);
    }

    public function show($id): PurchaseReturnResource
    {
        $purchaseReturn = $this->purchaseReturnRepository->find($id);

        return new PurchaseReturnResource($purchaseReturn);
    }

    public function edit(PurchaseReturn $purchasesReturn): PurchaseReturnResource
    {
        $purchasesReturn = $purchasesReturn->load('purchaseReturnItems.product.stocks', 'warehouse');

        return new PurchaseReturnResource($purchasesReturn);
    }

    public function editByPurchase($purchaseId)
    {
        $purchaseReturn = PurchaseReturn::where('purchase_id', $purchaseId)->first();
        if (empty($purchaseReturn)) {
            return $this->sendError('Purchase Return is not created');
        }
        $purchaseReturn = $purchaseReturn->load('purchaseReturnItems', 'purchaseReturnItems.product.stocks', 'warehouse');

        return new PurchaseReturnResource($purchaseReturn);
    }

    public function update(UpdatePurchaseReturnRequest $request, $id): PurchaseReturnResource
    {
        $input = $request->all();
        $purchaseReturn = $this->purchaseReturnRepository->updatePurchaseReturn($input, $id);

        return new PurchaseReturnResource($purchaseReturn);
    }
    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids) || empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $canDeleteIds = [];

        try {
            foreach ($ids as $id) {
                DB::beginTransaction();

                $purchaseReturn = $this->purchaseReturnRepository
                    ->with('purchaseReturnItems', 'purchase')
                    ->where('id', $id)
                    ->first();

                if (!$purchaseReturn) {
                    $canDeleteIds[] = [
                        'id' => $id,
                        'name' => 'Purchase Return not found',
                    ];
                    DB::rollBack();
                    continue;
                }

                foreach ($purchaseReturn->purchaseReturnItems as $item) {
                    manageStock(
                        $purchaseReturn->warehouse_id,
                        $item['product_id'],
                        $item['quantity']
                    );
                }

                if ($purchaseReturn->purchase) {
                    $purchaseReturn->purchase->update(['is_return' => 0]);
                }

                $this->purchaseReturnRepository->delete($purchaseReturn->id);

                DB::commit();
            }

            if (count($ids) === 1) {
                return $this->sendSuccess('Purchase Return Deleted successfully');
            }

            return $this->sendResponse([
                'show_model' => count($canDeleteIds) > 0,
                'ids' => $canDeleteIds,
            ], 'Purchase Return(s) delete process completed.');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError('Something went wrong: ' . $e->getMessage());
        }
    }

    public function purchaseReturnInfo(PurchaseReturn $purchaseReturn): JsonResponse
    {
        $purchaseReturn = $purchaseReturn->load(['purchaseReturnItems.product', 'warehouse', 'supplier']);
        $keyName = [
            'store_email',
            'store_name',
            'store_phone',
            'store_address',
        ];
        $companyInfo = Setting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        if (getActiveStoreName()) {
            $companyInfo['store_name'] = getActiveStoreName();
        }
        $purchaseReturn->company_info = $companyInfo;

        return $this->sendResponse($purchaseReturn, 'Purchase Return information retrieved successfully');
    }

    /**
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig
     */
    public function pdfDownload(PurchaseReturn $purchaseReturn): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $purchaseReturn = $purchaseReturn->load('purchaseReturnItems.product', 'supplier');

        $data = [];
        if (Storage::exists('pdf/purchase_return-' . $purchaseReturn->reference_code . '.pdf')) {
            Storage::delete('pdf/purchase_return-' . $purchaseReturn->reference_code . '.pdf');
        }

        $companyLogo = getStoreLogo();
        $companyLogo = PdfLogo::dataUri($companyLogo);

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.purchase-return-pdf' : 'pdf.purchase-return-pdf';

        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('purchaseReturn', 'companyLogo'));

        Storage::disk(config('app.media_disc'))->put(
            'pdf/purchase_return-' . $purchaseReturn->reference_code . '.pdf',
            $pdfContent
        );
        $data['purchase_return_pdf_url'] = Storage::url('pdf/purchase_return-' . $purchaseReturn->reference_code . '.pdf');

        return $this->sendResponse($data, 'purchase return pdf retrieved Successfully');
    }

    public function getPurchaseReturnProductReport(Request $request): PurchaseReturnCollection
    {
        $perPage = getPageSize($request);
        $productId = $request->get('product_id');
        $search = $request->filter['search'] ?? '';

        $purchasesReturn = PurchaseReturn::with(['supplier', 'warehouse', 'purchaseReturnItems.product'])
            ->whereHas('supplier')
            ->whereHas('warehouse');

        if ($productId) {
            $purchasesReturn->whereHas('purchaseReturnItems', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        if (!isAdmin()) {
            $purchasesReturn->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if (!empty($search)) {
            $purchasesReturn->where(function ($query) use ($search) {
                $query->orWhere('reference_code', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%")
                    ->orWhere('tax_rate', 'LIKE', "%{$search}%")
                    ->orWhere('tax_amount', 'LIKE', "%{$search}%")
                    ->orWhere('discount', 'LIKE', "%{$search}%")
                    ->orWhere('shipping', 'LIKE', "%{$search}%")
                    ->orWhere('grand_total', 'LIKE', "%{$search}%")
                    ->orWhere('received_amount', 'LIKE', "%{$search}%")
                    ->orWhere('paid_amount', 'LIKE', "%{$search}%")
                    ->orWhere('payment_type', 'LIKE', "%{$search}%")
                    ->orWhere('notes', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%")
                    ->orWhereHas('supplier', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('warehouse', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('purchaseReturnItems.product', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('code', 'LIKE', "%{$search}%");
                    });
            });
        }

        $sort = $request->get('sort');
        if ($sort) {
            $direction = 'asc';
            if (str_starts_with($sort, '-')) {
                $direction = 'desc';
                $sort = ltrim($sort, '-');
            }
            $purchasesReturn->orderBy($sort, $direction);
        } else {
            $purchasesReturn->orderBy('id', 'desc');
        }

        $purchasesReturn = $purchasesReturn->paginate($perPage);

        PurchaseReturnResource::usingWithCollection();

        return new PurchaseReturnCollection($purchasesReturn);
    }
}
