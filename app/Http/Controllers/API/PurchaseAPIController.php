<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreatePurchaseRequest;
use App\Http\Requests\UpdatePurchaseRequest;
use App\Http\Resources\PurchaseCollection;
use App\Http\Resources\PurchaseResource;
use App\Models\ManageStock;
use App\Models\PaymentMethod;
use App\Models\Purchase;
use App\Models\Setting;
use App\Repositories\PurchaseRepository;
use App\Support\PdfLogo;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class PurchaseAPIController
 */
class PurchaseAPIController extends AppBaseController
{
    /** @var PurchaseRepository */
    private $purchaseRepository;

    public function __construct(PurchaseRepository $purchaseRepository)
    {
        $this->purchaseRepository = $purchaseRepository;
    }

    public function index(Request $request): PurchaseCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        // $supplier = (Supplier::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // if(isAdmin()){
        //     $warehouse = (Warehouse::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // } else {
        //     $warehouse = (Warehouse::whereIn('id', getLoginUserWarehouseIds())->where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // }
        // $products = (Product::where('name', 'LIKE', "%$search%")->orWhere('code', 'LIKE', "%$search%")->get()->count() != 0);
        // $purchases = $this->purchaseRepository;
        $purchases = Purchase::with(['supplier', 'warehouse', 'paymentType', 'purchaseItems'])->whereHas('supplier')->whereHas('warehouse');
        if (!isAdmin()) {
            $purchases->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }
        if (!empty($search)) {
            $purchases->where(function ($query) use ($search) {
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
                    ->orWhereHas('purchaseItems.product', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('code', 'LIKE', "%{$search}%");
                    });
            });
        }
        // if ($supplier) {
        //     $purchases->whereHas('supplier', function (Builder $q) use ($search, $supplier) {
        //         if ($supplier) {
        //             $q->where('name', 'LIKE', "%$search%");
        //         }
        //     });
        // }
        // if ($warehouse) {
        //     $purchases->whereHas('warehouse', function (Builder $q) use ($search, $warehouse) {
        //         if ($warehouse) {
        //             $q->where('name', 'LIKE', "%$search%");
        //         }
        //     });
        // }
        // if ($products) {
        //     $purchases->whereHas('purchaseItems', function (Builder $q) use ($search) {
        //         $q->whereHas('product', function (Builder $q) use ($search) {
        //             $q->where('name', 'LIKE', "%$search%")
        //                 ->orWhere('code', 'LIKE', "%$search%");
        //         });
        //     });
        // }

        if ($request->get('start_date') && $request->get('end_date')) {
            $purchases->whereBetween('date', [$request->get('start_date'), $request->get('end_date')]);
        }

        if ($request->get('warehouse_id') && $request->get('warehouse_id') != 'null' && $request->get('warehouse_id') != 'all') {
            $purchases->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('status')) {
            $purchases->where('status', $request->get('status'));
        }

        $sort = $request->get('sort');
        if ($sort) {
            $direction = 'asc';
            if (str_starts_with($sort, '-')) {
                $direction = 'desc';
                $sort = ltrim($sort, '-');
            }
            $purchases->orderBy($sort, $direction);
        } else {
            $purchases->orderBy('id', 'desc');
        }

        $purchases = $purchases->paginate($perPage);

        PurchaseResource::usingWithCollection();

        return new PurchaseCollection($purchases);
    }

    public function store(CreatePurchaseRequest $request): PurchaseResource
    {
        $input = $request->all();
        $purchase = $this->purchaseRepository->storePurchase($input);

        return new PurchaseResource($purchase);
    }

    public function show($id): PurchaseResource
    {
        $purchase = $this->purchaseRepository->find($id);

        return new PurchaseResource($purchase);
    }

    public function edit(Purchase $purchase): PurchaseResource
    {
        $purchase = $purchase->load('purchaseItems.product.stocks', 'warehouse');

        return new PurchaseResource($purchase);
    }

    public function update(UpdatePurchaseRequest $request, $id): PurchaseResource
    {
        $input = $request->all();
        $purchase = $this->purchaseRepository->updatePurchase($input, $id);

        return new PurchaseResource($purchase);
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

                $purchase = Purchase::with('purchaseItems')->where('id', $id)->first();

                if (!$purchase) {
                    throw new UnprocessableEntityHttpException(__('Purchase not found'));
                }

                foreach ($purchase->purchaseItems as $item) {
                    $product = ManageStock::whereWarehouseId($purchase->warehouse_id)
                        ->whereProductId($item['product_id'])
                        ->first();

                    if ($product) {
                        if ($product->quantity >= $item['quantity']) {
                            $totalQuantity = $product->quantity - $item['quantity'];
                            $product->update([
                                'quantity' => $totalQuantity,
                            ]);
                        } else {
                            throw new UnprocessableEntityHttpException(
                                __('messages.error.purchase_available_quantity', [
                                    'reference_code' => $purchase->reference_code ?? 'Unnamed',
                                    'product_name' => $item?->product?->name ?? 'Product not found',
                                ])
                            );
                        }
                    }
                }

                $purchase->delete();

                DB::commit();
            } catch (\Exception $e) {
                $canDeleteIds[] = [
                    'id' => $id,
                    'name' => $e->getMessage(),
                ];
                DB::rollBack();
            }
        }

        if (count($ids) === 1) {
            if (count($canDeleteIds) > 0) {
                return $this->sendError($canDeleteIds[0]['name'] ?? 'Purchase not deleted');
            }
            return $this->sendSuccess('Purchase Deleted successfully');
        }
        return $this->sendResponse([
            'show_model' => count($canDeleteIds) > 0,
            'ids' => $canDeleteIds,
        ], 'Purchase(s) delete process completed.');
    }

    /**
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig
     */
    public function pdfDownload(Purchase $purchase): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $purchase = $purchase->load('purchaseItems.product', 'supplier');

        $data = [];
        if (Storage::exists('pdf.purchase-pdf-' . $purchase->reference_code . '.pdf')) {
            Storage::delete('pdf.purchase-pdf-' . $purchase->reference_code . '.pdf');
        }

        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);
        $purchasePaymentTypeName = $purchase->payment_type ? PaymentMethod::where('id', $purchase->payment_type)->first()->name : "";
        $purchase->payment_type_name = $purchasePaymentTypeName;
        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.purchase-pdf' : 'pdf.purchase-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('purchase', 'companyLogo'));
        
        Storage::disk(config('app.media_disc'))->put('pdf/Purchase-' . $purchase->reference_code . '.pdf', $pdfContent);
        $data['purchase_pdf_url'] = Storage::url('pdf/Purchase-' . $purchase->reference_code . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function purchaseInfo(Purchase $purchase): JsonResponse
    {
        $purchase = $purchase->load(['purchaseItems.product', 'warehouse', 'supplier']);
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
        $purchase->company_info = $companyInfo;

        return $this->sendResponse($purchase, 'Purchase information retrieved successfully');
    }

    public function getPurchaseProductReport(Request $request): PurchaseCollection
    {
        $perPage = getPageSize($request);
        $productId = $request->get('product_id');
        $search = $request->filter['search'] ?? '';

        $purchases = Purchase::with(['supplier', 'warehouse', 'paymentType', 'purchaseItems.product'])
            ->whereHas('supplier')
            ->whereHas('warehouse');

        if ($productId) {
            $purchases->whereHas('purchaseItems', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        if (!isAdmin()) {
            $purchases->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if (!empty($search)) {
            $purchases->where(function ($query) use ($search) {
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
                    ->orWhereHas('purchaseItems.product', function ($q) use ($search) {
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
            $purchases->orderBy($sort, $direction);
        } else {
            $purchases->orderBy('id', 'desc');
        }

        $purchases = $purchases->paginate($perPage);

        PurchaseResource::usingWithCollection();

        return new PurchaseCollection($purchases);
    }
}
