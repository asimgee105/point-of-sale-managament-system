<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerCollection;
use App\Http\Resources\CustomerResource;
use App\Imports\CustomerImport;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\SalesPayment;
use App\Repositories\CustomerRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Support\PdfLogo;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class CustomerAPIController
 */
class CustomerAPIController extends AppBaseController
{
    /** @var CustomerRepository */
    private $customerRepository;

    public function __construct(CustomerRepository $customerRepository)
    {
        $this->customerRepository = $customerRepository;
    }

    public function index(Request $request): CustomerCollection
    {
        $perPage = getPageSize($request);
        $customers = $this->customerRepository->paginate($perPage);
        CustomerResource::usingWithCollection();

        return new CustomerCollection($customers);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateCustomerRequest $request): CustomerResource
    {
        $input = $request->all();
        if (! empty($input['dob'])) {
            $input['dob'] = $input['dob'] ?? date('Y/m/d');
        }
        $customer = $this->customerRepository->create($input);

        return new CustomerResource($customer);
    }

    public function show($id): CustomerResource
    {
        $customer = $this->customerRepository->find($id);

        return new CustomerResource($customer);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateCustomerRequest $request, $id): CustomerResource
    {
        $input = $request->all();
        if (! empty($input['dob'])) {
            $input['dob'] = $input['dob'] ?? date('Y/m/d');
        }
        $customer = $this->customerRepository->update($input, $id);

        return new CustomerResource($customer);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request.');
        }

        if (count($ids) === 1) {
            if (getSettingValue('default_customer') == $ids[0]) {
                return $this->SendError(__('messages.error.default_customer_cant_delete'));
            }
            $this->customerRepository->delete($ids[0]);

            return $this->sendSuccess('Customer deleted successfully');
        }

        $failed = [];

        foreach ($ids as $id) {
            $customer = $this->customerRepository->find($id);

            if (getSettingValue('default_customer') == $id) {
                $failed[] = [
                    'id' => $id,
                    'name' => $customer->name ?? '',
                ];
            } else {
                $customer->delete();
            }
        }

        return $this->sendResponse([
            'show_model' => count($failed) > 0,
            'ids' => $failed,
        ], 'Customer delete process completed.');
    }

    public function bestCustomersPdfDownload(): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $month = Carbon::now()->month;
        $tenantId = currentTenantId();

        $topCustomers = Customer::withoutGlobalScope('tenant')
            ->leftJoin('sales', 'customers.id', '=', 'sales.customer_id')
            ->whereMonth('sales.date', $month)
            ->where('customers.tenant_id', $tenantId)
            ->select('customers.*', DB::raw('sum(sales.grand_total) as grand_total'))
            ->groupBy('customers.id')
            ->orderBy('grand_total', 'desc')
            ->latest()
            ->take(5)
            ->withCount([
                'sales' => function ($query) use ($tenantId) {
                    $query->where('sales.tenant_id', $tenantId);
                }
            ])
            ->get();

        $data = [];

        if (Storage::exists('pdf/best-customers.pdf')) {
            Storage::delete('pdf/best-customers.pdf');
        }

        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.best-customers-pdf' : 'pdf.best-customers-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('topCustomers', 'companyLogo'));
        
        Storage::disk(config('app.media_disc'))->put('pdf/best-customers.pdf', $pdfContent);
        $data['best_customers_pdf_url'] = Storage::url('pdf/best-customers.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function pdfDownload(Customer $customer): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $customer = $customer->load('sales.payments');

        $salesData = [];

        $salesData['totalSale'] = $customer->sales->count();

        $salesData['totalAmount'] = $customer->sales->sum('grand_total');

        $salesData['totalPaid'] = 0;

        foreach ($customer->sales as $sale) {
            $salesData['totalPaid'] = $salesData['totalPaid'] + $sale->payments->sum('amount');
        }

        $salesData['totalSalesDue'] = $salesData['totalAmount'] - $salesData['totalPaid'];

        $data = [];

        if (Storage::exists('pdf/customers-report-' . $customer->id . '.pdf')) {
            Storage::delete('pdf/customers-report-' . $customer->id . '.pdf');
        }

        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customers-report-pdf' : 'pdf.customers-report-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('customer', 'companyLogo', 'salesData'));
        
        Storage::disk(config('app.media_disc'))->put('pdf/customers-report-' . $customer->id . '.pdf', $pdfContent);
        $data['customers_report_pdf_url'] = Storage::url('pdf/customers-report-' . $customer->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function customerSalesPdfDownload(Customer $customer): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $customer = $customer->load('sales.payments');

        $data = [];

        if (Storage::exists('pdf/customer-sales-' . $customer->id . '.pdf')) {
            Storage::delete('pdf/customer-sales-' . $customer->id . '.pdf');
        }

        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-sales-pdf' : 'pdf.customer-sales-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('customer', 'companyLogo'));
        
        Storage::disk(config('app.media_disc'))->put('pdf/customer-sales-' . $customer->id . '.pdf', $pdfContent);
        $data['customers_sales_pdf_url'] = Storage::url('pdf/customer-sales-' . $customer->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function customerQuotationsPdfDownload(Customer $customer): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $customer = $customer->load('quotations');

        $data = [];

        if (Storage::exists('pdf/customer-quotations-' . $customer->id . '.pdf')) {
            Storage::delete('pdf/customer-quotations-' . $customer->id . '.pdf');
        }

        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-quotations-pdf' : 'pdf.customer-quotations-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('customer', 'companyLogo'));
        
        Storage::disk(config('app.media_disc'))->put('pdf/customer-quotations-' . $customer->id . '.pdf', $pdfContent);
        $data['customers_quotations_pdf_url'] = Storage::url('pdf/customer-quotations-' . $customer->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function customerReturnsPdfDownload(Customer $customer): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $customer = $customer->load('salesReturns');

        $data = [];

        if (Storage::exists('pdf/customer-returns-' . $customer->id . '.pdf')) {
            Storage::delete('pdf/customer-returns-' . $customer->id . '.pdf');
        }

        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-returns-pdf' : 'pdf.customer-returns-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('customer', 'companyLogo'));
        
        Storage::disk(config('app.media_disc'))->put('pdf/customer-returns-' . $customer->id . '.pdf', $pdfContent);
        $data['customers_returns_pdf_url'] = Storage::url('pdf/customer-returns-' . $customer->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function customerPaymentsPdfDownload($id): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $saleIds = [];

        $sales = Sale::whereCustomerId($id)->get();

        foreach ($sales as $sale) {
            $saleIds[] = $sale->id;
        }

        $payments = SalesPayment::whereIn('sale_id', $saleIds)->with('sale')->get();

        $data = [];

        if (Storage::exists('pdf/customer-payments-' . $id . '.pdf')) {
            Storage::delete('pdf/customer-payments-' . $id . '.pdf');
        }

        $companyLogo = getStoreLogo();

        $companyLogo = PdfLogo::dataUri($companyLogo);

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-payments-pdf' : 'pdf.customer-payments-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('payments', 'companyLogo'));
        
        Storage::disk(config('app.media_disc'))->put('pdf/customer-payments-' . $id . '.pdf', $pdfContent);
        $data['customers_payments_pdf_url'] = Storage::url('pdf/customer-payments-' . $id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }

    public function importCustomers(Request $request)
    {
        $this->validate($request, [
            'file' => 'required|file|mimes:csv',
        ]);
        Excel::import(new CustomerImport(), request()->file('file'));

        return $this->sendSuccess(__('messages.success.customers_imported'));
    }
}
