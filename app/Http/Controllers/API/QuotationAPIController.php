<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateQuotationRequest;
use App\Http\Requests\UpdateQuotationRequest;
use App\Http\Resources\QuotationCollection;
use App\Http\Resources\QuotationResource;
use App\Models\Customer;
use App\Models\Quotation;
use App\Models\Setting;
use App\Models\Taxes;
use App\Models\Warehouse;
use App\Repositories\QuotationRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Support\PdfLogo;

class QuotationAPIController extends AppBaseController
{
    /** @var quotationRepository */
    private $quotationRepository;

    public function __construct(QuotationRepository $quotationRepository)
    {
        $this->quotationRepository = $quotationRepository;
    }

    public function index(Request $request)
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? '';
        $customer = (Customer::where('name', 'LIKE', "%$search%")->get()->count() != 0);
        $warehouse = (Warehouse::where('name', 'LIKE', "%$search%")->get()->count() != 0);

        $quotations = $this->quotationRepository;
        if(!isAdmin()){
            $quotations->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if ($customer || $warehouse) {
            $quotations->whereHas('customer', function (Builder $q) use ($search, $customer) {
                if ($customer) {
                    $q->where('name', 'LIKE', "%$search%");
                }
            })->whereHas('warehouse', function (Builder $q) use ($search, $warehouse) {
                if ($warehouse) {
                    $q->where('name', 'LIKE', "%$search%");
                }
            });
        }

        if ($request->get('start_date') && $request->get('end_date')) {
            $quotations->whereBetween('date', [$request->get('start_date'), $request->get('end_date')]);
        }

        if ($request->get('warehouse_id')) {
            $quotations->where('warehouse_id', $request->get('warehouse_id'));
        }

        if ($request->get('customer_id')) {
            $quotations->where('customer_id', $request->get('customer_id'));
        }

        if ($request->get('status') && $request->get('status') != 'null') {
            $quotations->Where('status', $request->get('status'));
        }

        $quotations = $quotations->paginate($perPage);

        QuotationResource::usingWithCollection();

        return new QuotationCollection($quotations);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    public function store(CreateQuotationRequest $request): QuotationResource
    {
        $input = $request->all();
        $quotation = $this->quotationRepository->storeQuotation($input);

        return new QuotationResource($quotation);
    }

    public function show($id): QuotationResource
    {
        $quotation = $this->quotationRepository->find($id);

        return new QuotationResource($quotation);
    }

    public function quotationInfo(Quotation $quotation): JsonResponse
    {
        $quotation = $quotation->load('quotationItems.product', 'warehouse', 'customer');
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
        $quotation->company_info = $companyInfo;

        return $this->sendResponse($quotation, 'Quotation information retrieved successfully');
    }

    public function edit(Quotation $quotation): QuotationResource
    {
        $quotation = $quotation->load('quotationItems.product.stocks', 'warehouse');

        return new QuotationResource($quotation);
    }

    public function update(UpdateQuotationRequest $request, $id): QuotationResource
    {
        $input = $request->all();
        $quotation = $this->quotationRepository->updateQuotation($input, $id);

        return new QuotationResource($quotation);
    }

    public function destroy(Request $request)
    {
        $ids = $request->id;

        if (!is_array($ids) || empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        // $canDeleteIds = [];

        if (count($ids) === 1) {
            $this->quotationRepository->delete($ids[0]);

            return $this->sendSuccess('Quotation Deleted successfully');
        }

        foreach ($ids as $id) {
            $this->quotationRepository->delete($id);
        }

        return $this->sendSuccess('Quotation Deleted successfully');
    }

    public function pdfDownload(Quotation $quotation): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $quotation = $quotation->load('customer', 'quotationItems.product');
        $data = [];
        if (Storage::exists('pdf/Quotation-' . $quotation->reference_code . '.pdf')) {
            Storage::delete('pdf/Quotation-' . $quotation->reference_code . '.pdf');
        }
        $companyLogo = getStoreLogo();
        $companyLogo = PdfLogo::dataUri($companyLogo);
        $taxes = Taxes::where('status', 1)->get();

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.quotation-pdf' : 'pdf.quotation-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('quotation', 'companyLogo', 'taxes'));
        
        Storage::disk(config('app.media_disc'))->put(
            'pdf/Quotation-' . $quotation->reference_code . '.pdf',
            $pdfContent
        );
        $data['quotation_pdf_url'] = Storage::url('pdf/Quotation-' . $quotation->reference_code . '.pdf');

        return $this->sendResponse($data, 'Quotation pdf retrieved Successfully');
    }
}
