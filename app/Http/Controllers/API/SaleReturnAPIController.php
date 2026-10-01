<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateSaleReturnRequest;
use App\Http\Requests\UpdateSaleReturnRequest;
use App\Http\Resources\SaleReturnCollection;
use App\Http\Resources\SaleReturnResource;
use App\Models\Customer;
use App\Models\ManageStock;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\Setting;
use App\Models\Taxes;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Repositories\SaleReturnRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Support\PdfLogo;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SaleReturnAPIController extends AppBaseController
{
    /**
     * @var SaleReturnRepository
     */
    private $saleReturnRepository;

    /**
     * SaleReturnAPIController constructor.
     */
    public function __construct(SaleReturnRepository $saleReturnRepository)
    {
        $this->saleReturnRepository = $saleReturnRepository;
    }

    public function index(Request $request): SaleReturnCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        // $customer = (Customer::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // if(isAdmin()){
        //     $warehouse = (Warehouse::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // } else {
        //     $warehouse = (Warehouse::whereIn('id', getLoginUserWarehouseIds())->where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // }
        // $salesReturn = $this->saleReturnRepository;
        $salesReturn = SaleReturn::with(['customer', 'warehouse', 'saleReturnItems'])->whereHas('customer')->whereHas('warehouse');
        if (!isAdmin()) {
            $salesReturn->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        // if ($customer || $warehouse) {
        //     $salesReturn->whereHas('customer', function (Builder $q) use ($search, $customer) {
        //         if ($customer) {
        //             $q->where('name', 'LIKE', "%$search%");
        //         }
        //     })->whereHas('warehouse', function (Builder $q) use ($search, $warehouse) {
        //         if ($warehouse) {
        //             $q->where('name', 'LIKE', "%$search%");
        //         }
        //     });
        // }

        if ($request->get('start_date') && $request->get('end_date')) {
            $salesReturn->whereBetween('date', [$request->get('start_date'), $request->get('end_date')]);
        }

        if ($request->get('warehouse_id') && $request->get('warehouse_id') != 'all' && $request->get('warehouse_id') != 'null') {
            $salesReturn->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('customer_id')) {
            $salesReturn->where('customer_id', $request->get('customer_id'));
        }

        if ($request->get('status') && $request->get('status') != 'null') {
            $salesReturn->Where('status', $request->get('status'));
        }

        if ($request->get('payment_status') && $request->get('payment_status') != 'null') {
            $salesReturn->where('payment_status', $request->get('payment_status'));
        }

        if (!empty($search)) {
            $salesReturn->where(function ($query) use ($search) {
                $query->where('reference_code', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%")
                    ->orWhere('tax_rate', 'LIKE', "%{$search}%")
                    ->orWhere('tax_amount', 'LIKE', "%{$search}%")
                    ->orWhere('discount', 'LIKE', "%{$search}%")
                    ->orWhere('shipping', 'LIKE', "%{$search}%")
                    ->orWhere('grand_total', 'LIKE', "%{$search}%")
                    ->orWhere('paid_amount', 'LIKE', "%{$search}%")
                    ->orWhere('payment_type', 'LIKE', "%{$search}%")
                    ->orWhere('note', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('warehouse', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
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
            $salesReturn->orderBy($sort, $direction);
        } else {
            $salesReturn->orderBy('id', 'desc');
        }

        $salesReturn = $salesReturn->paginate($perPage);

        SaleReturnResource::usingWithCollection();

        return new SaleReturnCollection($salesReturn);
    }

    public function store(CreateSaleReturnRequest $request): SaleReturnResource
    {
        $input = $request->all();
        $saleReturn = $this->saleReturnRepository->storeSaleReturn($input);

        return new SaleReturnResource($saleReturn);
    }

    public function show($id): SaleReturnResource
    {
        $saleReturn = $this->saleReturnRepository->find($id);

        return new SaleReturnResource($saleReturn);
    }

    public function edit(SaleReturn $salesReturn): SaleReturnResource
    {
        $salesReturn = $salesReturn->load('saleReturnItems.product', 'warehouse');

        return new SaleReturnResource($salesReturn);
    }

    public function editBySale($saleId)
    {
        $salesReturn = SaleReturn::where('sale_id', $saleId)->first();
        if (empty($salesReturn)) {
            return $this->sendError('Sale Return is not created');
        }
        $salesReturn = $salesReturn->load('saleReturnItems', 'saleReturnItems.product', 'warehouse');

        return new SaleReturnResource($salesReturn);
    }

    public function update(UpdateSaleReturnRequest $request, $id): SaleReturnResource
    {
        $input = $request->all();
        $saleReturn = $this->saleReturnRepository->updateSaleReturn($input, $id);

        return new SaleReturnResource($saleReturn);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids) || empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $canDeleteIds = [];

        foreach ($ids as $id) {
            try {
                DB::beginTransaction();

                $saleReturn = SaleReturn::with(['saleReturnItems.product', 'sale'])->where('id', $id)->first();

                if (!$saleReturn) {
                    throw new UnprocessableEntityHttpException(__('Sale Return not found.'));
                }

                if ($saleReturn->sale) {
                    $saleReturn->sale->update(['is_return' => 0]);
                }

                foreach ($saleReturn->saleReturnItems as $item) {
                    $product = ManageStock::whereWarehouseId($saleReturn->warehouse_id)
                        ->whereProductId($item['product_id'])
                        ->first();

                    if ($product) {
                        if ($product->quantity >= $item['quantity']) {
                            $product->update([
                                'quantity' => $product->quantity - $item['quantity'],
                            ]);
                        } else {
                            throw new UnprocessableEntityHttpException(sprintf(
                                'Cannot delete Sale Return %s — insufficient stock for product %s.',
                                $saleReturn->reference_code ?? 'Unnamed',
                                $item?->product?->name ?? 'Product not found'
                            ));
                        }
                    }
                }

                $saleReturn->delete();

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $canDeleteIds[] = [
                    'id' => $id,
                    'name' => $e->getMessage(),
                ];
            }
        }

        if (count($ids) === 1) {
            if (count($canDeleteIds) > 0) {
                return $this->sendError($canDeleteIds[0]['name'] ?? 'Sale Return not deleted');
            }
            return $this->sendSuccess('Sale Return deleted successfully.');
        }

        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds,
        ], 'Sale Returns delete process completed.');
    }

    public function saleReturnInfo(SaleReturn $salesReturn): JsonResponse
    {
        $salesReturn = $salesReturn->load('saleReturnItems.product', 'warehouse', 'customer');
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
        $salesReturn->company_info = $companyInfo;

        return $this->sendResponse($salesReturn, 'Sale Return information retrieved successfully');
    }

    /**
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig
     */
    public function pdfDownload(SaleReturn $saleReturn): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $saleReturn = $saleReturn->load('customer', 'saleReturnItems.product');
        $data = [];
        if (Storage::exists('pdf/sale_return-' . $saleReturn->reference_code . '.pdf')) {
            Storage::delete('pdf/sale_return-' . $saleReturn->reference_code . '.pdf');
        }
        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);

        $taxes = Taxes::where('status', 1)->get();

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.sale-return-pdf' : 'pdf.sale-return-pdf';

        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('saleReturn', 'companyLogo', 'taxes'));

        Storage::disk(config('app.media_disc'))->put(
            'pdf/sale_return-' . $saleReturn->reference_code . '.pdf',
            $pdfContent
        );
        $data['sale_return_pdf_url'] = Storage::url('pdf/sale_return-' . $saleReturn->reference_code . '.pdf');

        return $this->sendResponse($data, 'Sale return pdf retrieved Successfully');
    }

    public function getSaleReturnProductReport(Request $request): SaleReturnCollection
    {
        $perPage = getPageSize($request);
        $productId = $request->get('product_id');
        $search = $request->filter['search'] ?? '';

        $salesReturn = SaleReturn::with(['customer', 'warehouse', 'saleReturnItems.product'])
            ->whereHas('customer')
            ->whereHas('warehouse');

        if ($productId) {
            $salesReturn->whereHas('saleReturnItems', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        if (!isAdmin()) {
            $salesReturn->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if (!empty($search)) {
            $salesReturn->where(function ($query) use ($search) {
                $query->where('reference_code', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%")
                    ->orWhere('tax_rate', 'LIKE', "%{$search}%")
                    ->orWhere('tax_amount', 'LIKE', "%{$search}%")
                    ->orWhere('discount', 'LIKE', "%{$search}%")
                    ->orWhere('shipping', 'LIKE', "%{$search}%")
                    ->orWhere('grand_total', 'LIKE', "%{$search}%")
                    ->orWhere('paid_amount', 'LIKE', "%{$search}%")
                    ->orWhere('payment_type', 'LIKE', "%{$search}%")
                    ->orWhere('note', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('warehouse', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('saleReturnItems.product', function ($q) use ($search) {
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
            $salesReturn->orderBy($sort, $direction);
        } else {
            $salesReturn->orderBy('id', 'desc');
        }

        $salesReturn = $salesReturn->paginate($perPage);

        SaleReturnResource::usingWithCollection();

        return new SaleReturnCollection($salesReturn);
    }

    public function markAsPaid(int $id): JsonResponse
    {
        try {
            DB::beginTransaction();
            $saleReturn = $this->saleReturnRepository->where('id', $id)->first();
            $saleReturn->update([
                'status' => 1
            ]);

            DB::commit();

            return $this->sendSuccess('Mark as paid successfully');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }
    }
}
