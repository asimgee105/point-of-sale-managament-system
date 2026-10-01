<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Http\Resources\SaleCollection;
use App\Http\Resources\SaleResource;
use App\Models\Customer;
use App\Models\Hold;
use App\Models\Product;
use App\Models\Role;
use App\Models\Sale;
use App\Models\Taxes;
use App\Models\Setting;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Repositories\SaleRepository;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use App\Support\PdfLogo;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SaleAPIController
 */
class SaleAPIController extends AppBaseController
{
    /** @var saleRepository */
    private $saleRepository;

    public function __construct(SaleRepository $saleRepository)
    {
        $this->saleRepository = $saleRepository;
    }

    public function index(Request $request): SaleCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        // $customer = (Customer::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // if(isAdmin()){
        //     $warehouse = (Warehouse::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // } else {
        //     $warehouse = (Warehouse::whereIn('id', getLoginUserWarehouseIds())->where('name', 'LIKE', "%$search%")->get()->count() != 0);
        // }
        // $products = (Product::where('name', 'LIKE', "%$search%")->orWhere('code', 'LIKE', "%$search%")->get()->count() != 0);

        $sales = Sale::with(['customer', 'warehouse', 'payments', 'saleItems'])->whereHas('customer')->whereHas('warehouse');
        if (!isAdmin()) {
            $sales->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }
        if ($search) {
            $sales->where(function ($query) use ($search) {
                $query->where('reference_code', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%")
                    ->orWhere('grand_total', 'LIKE', "%{$search}%")
                    ->orWhere('paid_amount', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('warehouse', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('saleItems.product', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('code', 'LIKE', "%{$search}%");
                    });
            });
        }

        // if ($customer) {
        //     $sales->whereHas('customer', function (Builder $q) use ($search, $customer) {
        //         if ($customer) {
        //             $q->where('name', 'LIKE', "%$search%");
        //         }
        //     });
        // }
        // if ($warehouse) {
        //     $sales->whereHas('warehouse', function (Builder $q) use ($search, $warehouse) {
        //         if ($warehouse) {
        //             $q->where('name', 'LIKE', "%$search%");
        //         }
        //     });
        // }
        // if ($products) {
        //     $sales->whereHas('saleItems', function (Builder $q) use ($search) {
        //         $q->whereHas('product', function (Builder $q) use ($search) {
        //             $q->where('name', 'LIKE', "%$search%")
        //                 ->orWhere('code', 'LIKE', "%$search%");
        //         });
        //     });
        // }

        if ($request->get('start_date') && $request->get('end_date')) {
            $sales->whereBetween('date', [$request->get('start_date'), $request->get('end_date')]);
        }

        if ($request->get('warehouse_id') && $request->get('warehouse_id') != 'all' && $request->get('warehouse_id') != 'null') {
            $sales->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('customer_id')) {
            $sales->where('customer_id', $request->get('customer_id'));
        }
        if ($request->get('user_id')) {
            $sales->where('user_id', $request->get('user_id'));
        }

        if ($request->get('status') && $request->get('status') != 'null') {
            $sales->Where('status', $request->get('status'));
        }

        if ($request->get('payment_status') && $request->get('payment_status') != 'null') {
            $sales->where('payment_status', $request->get('payment_status'));
        }

        if ($request->get('payment_type') && $request->get('payment_type') != 'null') {
            $sales->where('payment_type', $request->get('payment_type'));
        }

        $sort = $request->get('sort');
        if ($sort) {
            $direction = 'asc';
            if (str_starts_with($sort, '-')) {
                $direction = 'desc';
                $sort = ltrim($sort, '-');
            }
            $sales->orderBy($sort, $direction);
        } else {
            $sales->orderBy('id', 'desc');
        }

        $sales = $sales->paginate($perPage);

        SaleResource::usingWithCollection();

        return new SaleCollection($sales);
    }

    public function store(CreateSaleRequest $request): SaleResource
    {
        if (isset($request->hold_ref_no)) {
            $holdExist = Hold::whereReferenceCode($request->hold_ref_no)->first();
            if (!empty($holdExist)) {
                $holdExist->delete();
            }
        }
        $input = $request->all();
        if (isset($input['payment_status']) && $input['payment_status'] != Sale::UNPAID) {
            $grand_total = floatval($input['grand_total'] ?? 0);
            $paymentDetails = $input['payment_details'] ?? [];

            if (empty($paymentDetails) || !is_array($paymentDetails)) {
                throw new UnprocessableEntityHttpException('Payment details are required when payment status is PAID.');
            }

            $totalAmount = collect($paymentDetails)->sum(function ($detail) {
                return floatval($detail['amount'] ?? 0);
            });

            // if ($totalAmount > $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount cannot be greater than the grand total.');
            // }

            // if ($totalAmount < $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount should be equal to grand total.');
            // }
        }
        $sale = $this->saleRepository->storeSale($input);

        return new SaleResource($sale);
    }

    public function show($id): SaleResource
    {
        $sale = $this->saleRepository->find($id);

        return new SaleResource($sale);
    }

    public function edit(Sale $sale): SaleResource
    {
        $sale = $sale->load('saleItems.product.stocks', 'warehouse');

        return new SaleResource($sale);
    }

    public function update(UpdateSaleRequest $request, $id): SaleResource
    {
        $input = $request->all();
        if (isset($input['payment_status']) && $input['payment_status'] != Sale::UNPAID) {
            $grand_total = floatval($input['grand_total'] ?? 0);
            $paymentDetails = $input['payment_details'] ?? [];

            if (empty($paymentDetails) || !is_array($paymentDetails)) {
                throw new UnprocessableEntityHttpException('Payment details are required when payment status is PAID.');
            }

            $totalAmount = collect($paymentDetails)->sum(function ($detail) {
                return floatval($detail['amount'] ?? 0);
            });

            // if ($totalAmount > $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount cannot be greater than the grand total.');
            // }

            // if ($totalAmount < $grand_total) {
            //     throw new UnprocessableEntityHttpException('Total payment amount should be equal to grand total.');
            // }
        }
        $sale = $this->saleRepository->updateSale($input, $id);

        return new SaleResource($sale);
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

                $sale = $this->saleRepository->with('saleItems')->where('id', $id)->first();

                if (!$sale) {
                    $canDeleteIds[] = ['id' => $id, 'name' => 'Sale not found'];
                    DB::rollBack();
                    continue;
                }

                foreach ($sale->saleItems as $saleItem) {
                    manageStock($sale->warehouse_id, $saleItem['product_id'], $saleItem['quantity']);
                }

                $barcodePath = Storage::path('sales/barcode-' . $sale->reference_code . '.png');
                if (File::exists($barcodePath)) {
                    File::delete($barcodePath);
                }

                $this->saleRepository->delete($id);

                DB::commit();
            }

            if (count($ids) === 1) {
                return $this->sendSuccess('Sale Deleted successfully');
            }

            return $this->sendResponse([
                'show_model' => count($canDeleteIds) > 0,
                'ids' => $canDeleteIds,
            ], 'Sale(s) delete process completed.');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage());
        }
    }

    /**
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig
     */
    public function pdfDownload(Sale $sale): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $sale = $sale->load('customer', 'saleItems.product', 'payments');
        $data = [];
        if (Storage::exists('pdf/Sale-' . $sale->reference_code . '.pdf')) {
            Storage::delete('pdf/Sale-' . $sale->reference_code . '.pdf');
        }
        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);

        $taxes = Taxes::where('status', 1)->get();

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.sale-pdf' : 'pdf.sale-pdf';

        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('sale', 'companyLogo', 'taxes'));

        Storage::disk(config('app.media_disc'))->put('pdf/Sale-' . $sale->reference_code . '.pdf', $pdfContent);
        $data['sale_pdf_url'] = Storage::url('pdf/Sale-' . $sale->reference_code . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function saleInfo(Sale $sale): JsonResponse
    {
        $sale = $sale->load('saleItems.product', 'warehouse', 'customer', 'payments');
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
        $sale->company_info = $companyInfo;
        $sale['barcode_url'] = Storage::url('sales/barcode-' .  $sale->reference_code . '.png');
        return $this->sendResponse($sale, 'Sale information retrieved successfully');
    }

    public function getSaleProductReport(Request $request): SaleCollection
    {
        $perPage = getPageSize($request);
        $productId = $request->get('product_id');
        $search = $request->filter['search'] ?? '';

        $sales = Sale::with(['customer', 'warehouse', 'payments', 'saleItems.product'])->whereHas('customer')->whereHas('warehouse');

        if ($productId) {
            $sales->whereHas('saleItems', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        if (!isAdmin()) {
            $sales->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if ($search) {
            $sales->where(function ($query) use ($search) {
                $query->where('reference_code', 'LIKE', "%{$search}%")
                    ->orWhere('date', 'LIKE', "%{$search}%")
                    ->orWhere('grand_total', 'LIKE', "%{$search}%")
                    ->orWhere('paid_amount', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('warehouse', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('saleItems.product', function ($q) use ($search) {
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
            $sales->orderBy($sort, $direction);
        } else {
            $sales->orderBy('id', 'desc');
        }

        $sales = $sales->paginate($perPage);

        SaleResource::usingWithCollection();

        return new SaleCollection($sales);
    }
}
