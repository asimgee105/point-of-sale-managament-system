<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\SaleCollection;
use App\Http\Resources\SaleResource;
use App\Models\BaseUnit;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\ManageStock;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseReturn;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\SalesPayment;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardAPIController extends AppBaseController
{
    public function getPurchaseSalesCounts(): JsonResponse
    {
        $data = [];
        $today = Carbon::today();
        $sales = Sale::whereHas('warehouse')->where('date', $today);
        $saleReturn = SaleReturn::whereHas('warehouse')->where('date', $today);
        $purchases = Purchase::whereHas('warehouse')->where('date', $today);
        $purchaseReturn = PurchaseReturn::whereHas('warehouse')->where('date', $today);
        $expense = Expense::whereHas('warehouse')->where('date', $today);
        $salesPayment = SalesPayment::whereHas('sale')->where('payment_date', $today);
        if (!isAdmin()) {
            $sales->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $saleReturn->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $purchases->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $purchaseReturn->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $expense->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $salesPayment->whereHas('sale', function ($query) {
                $query->whereIn('warehouse_id', getLoginUserWarehouseIds());
            });
        }
        $data['today_sales'] = (float) $sales->sum('grand_total');
        $data['today_sale_return'] = (float) $saleReturn->sum('grand_total');
        $data['today_purchases'] = (float) $purchases->sum('grand_total');
        $data['today_purchase_return'] = (float) $purchaseReturn->sum('grand_total');
        $data['today_expense_count'] = (float) $expense->sum('amount');
        $data['today_sales_received_count'] = (float) $salesPayment->sum('amount');

        return $this->sendResponse($data, 'Sales Purchase Count Retrieved Successfully');
    }

    public function getAllPurchaseSalesCounts(): JsonResponse
    {
        $startDate = request()->query('start_date');
        $endDate = request()->query('end_date');

        $data = [];

        $salesQuery = Sale::query();
        $saleReturnQuery = SaleReturn::query()->whereHas('warehouse');
        $purchaseReturnQuery = PurchaseReturn::query()->whereHas('warehouse');
        $purchaseQuery = Purchase::query()->whereHas('warehouse');
        $salesPaymentQuery = SalesPayment::query()->whereHas('sale');
        $expenseQuery = Expense::query()->whereHas('warehouse');

        if (!isAdmin()) {
            $salesQuery->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $saleReturnQuery->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $purchaseReturnQuery->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $purchaseQuery->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $salesPaymentQuery->whereHas('sale', function ($query) {
                $query->whereIn('warehouse_id', getLoginUserWarehouseIds());
            });
            $expenseQuery->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if ($startDate && $endDate) {
            $salesQuery->whereBetween('date', [$startDate, $endDate]);
            $saleReturnQuery->whereBetween('date', [$startDate, $endDate]);
            $purchaseReturnQuery->whereBetween('date', [$startDate, $endDate]);
            $purchaseQuery->whereBetween('date', [$startDate, $endDate]);
            $salesPaymentQuery->whereBetween('payment_date', [$startDate, $endDate]);
            $expenseQuery->whereBetween('date', [$startDate, $endDate]);
        }

        $data['all_sales_count'] = (float) $salesQuery->sum('grand_total');
        $data['all_sale_return_count'] = (float) $saleReturnQuery->sum('grand_total');
        $data['all_purchase_return_count'] = (float) $purchaseReturnQuery->sum('grand_total');
        $data['all_purchases_count'] = (float) $purchaseQuery->sum('grand_total') - $data['all_purchase_return_count'];
        $data['all_sales_received_count'] = (float) $salesPaymentQuery->sum('amount');
        $data['all_expense_count'] = (float) $expenseQuery->sum('amount');

        return $this->sendResponse($data, 'All Sales Purchase and Returns Count Retrieved Successfully');
    }

    public function getRecentSales(): SaleCollection
    {
        $query = Sale::query();
        if (!isAdmin()) {
            $query->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }
        $recentSales = $query->latest()->take(5)->get();
        SaleResource::usingWithCollection();

        return new SaleCollection($recentSales);
    }

    public function getTopSellingProducts(): JsonResponse
    {
        $month = Carbon::now()->month;
        $year = Carbon::now()->year;
        $query = Product::withoutGlobalScopes()
            ->leftJoin('sale_items', 'products.id', '=', 'sale_items.product_id')
            ->leftJoin('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->whereMonth('sales.date', $month)
            ->whereYear('sales.date', $year)
            ->where('products.tenant_id', Auth::user()->tenant_id)
            ->where('sales.tenant_id', Auth::user()->tenant_id);

        if (!isAdmin()) {
            $query->whereIn('sales.warehouse_id', getLoginUserWarehouseIds());
        }

        $topSellings = $query
            ->selectRaw('products.*, COALESCE(SUM(sale_items.sub_total),0) as grand_total')
            ->selectRaw('COALESCE(SUM(sale_items.quantity),0) as total_quantity')
            ->groupBy('products.id')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get();
        $data = [];
        foreach ($topSellings as $topSelling) {
            $data[] = $topSelling->prepareTopSelling();
        }

        return $this->sendResponse($data, 'Top Selling Products Retrieved Successfully');
    }

    public function getWeekSalePurchases(): JsonResponse
    {
        $count = 7;
        $days = [];
        $date = Carbon::tomorrow();
        for ($i = 0; $i < $count; $i++) {
            $days[] = $date->subDay()->format('Y-m-d');
        }
        $day['days'] = array_reverse($days);

        $salesQuery = Sale::query();
        $purchaseQuery = Purchase::whereHas('warehouse');
        if (!isAdmin()) {
            $salesQuery->whereIn('warehouse_id', getLoginUserWarehouseIds());

            $purchaseQuery->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        $sales = $salesQuery
            ->whereBetween('date', [$day['days'][0], $day['days'][6]])
            ->orderBy('date', 'desc')
            ->groupBy('date')
            ->get([
                DB::raw('DATE_FORMAT(date,"%Y-%m-%d") as week'),
                DB::raw('SUM(grand_total) as grand_total'),
            ])
            ->keyBy('week');

        $period = CarbonPeriod::create($day['days'][0], $day['days'][6]);
        $data['dates'] = array_map(function ($datePeriod) {
            return $datePeriod->format('Y-m-d');
        }, iterator_to_array($period));

        $data['sales'] = array_map(function ($datePeriod) use ($sales) {
            $week = $datePeriod->format('Y-m-d');
            return $sales->has($week) ? $sales->get($week)->grand_total : 0;
        }, iterator_to_array($period));

        $purchases = $purchaseQuery
            ->whereBetween('date', [$day['days'][0], $day['days'][6]])
            ->orderBy('date', 'desc')
            ->groupBy('date')
            ->get([
                DB::raw('DATE_FORMAT(date,"%Y-%m-%d") as week'),
                DB::raw('SUM(grand_total) as grand_total'),
            ])->keyBy('week');
        $data['purchases'] = array_map(function ($datePeriod) use ($purchases) {
            $week = $datePeriod->format('Y-m-d');

            return $purchases->has($week) ? $purchases->get($week)->grand_total : 0;
        }, iterator_to_array($period));

        return $this->sendResponse($data, 'Week of Sales Purchase Retrieved Successfully');
    }

    public function getYearlyTopSelling(): JsonResponse
    {
        $year = Carbon::now()->year;
        $query = Product::withoutGlobalScopes()
            ->leftJoin('sale_items', 'products.id', '=', 'sale_items.product_id')
            ->leftJoin('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->whereYear('sales.date', $year)
            ->where('products.tenant_id', Auth::user()->tenant_id)
            ->where('sales.tenant_id', Auth::user()->tenant_id);
        if (!isAdmin()) {
            $query->whereIn('sales.warehouse_id', getLoginUserWarehouseIds());
        }
        $topSellings = $query
            ->selectRaw('products.name, COALESCE(SUM(sale_items.quantity),0) as total_quantity')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get();
        $data = [];
        foreach ($topSellings as $topSelling) {
            $data['name'][] = $topSelling->name;
            $data['total_quantity'][] = $topSelling->total_quantity;
        }

        return $this->sendResponse($data, 'Yearly TopSelling Products Retrieved Successfully');
    }

    public function getTopCustomer(): JsonResponse
    {
        $month = Carbon::now()->month;
        $query = Customer::withoutGlobalScope('tenant')
            ->where('customers.tenant_id', Auth::user()->tenant_id)
            ->leftJoin('sales', 'customers.id', '=', 'sales.customer_id')
            ->whereMonth('sales.date', $month);

        if (!isAdmin()) {
            $query->whereIn('sales.warehouse_id', getLoginUserWarehouseIds());
        }

        $topCustomers = $query
            ->select('customers.*', DB::raw('sum(sales.grand_total) as grand_total'))
            ->groupBy('customers.id')
            ->orderBy('grand_total', 'desc')
            ->latest()
            ->take(5)
            ->get();
        $data = [];
        foreach ($topCustomers as $topCustomer) {
            $data['name'][] = $topCustomer->name;
            $data['grand_total'][] = (float) $topCustomer->grand_total;
        }

        return $this->sendResponse($data, 'Top Customers Retrieved Successfully');
    }

    public function stockAlerts(): JsonResponse
    {
        $query = ManageStock::with('warehouse')->where('alert', true);
        if (!isAdmin()) {
            $query->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }
        $manageStocks = $query->latest()->limit(10)->get();
        $productResponse = [];
        foreach ($manageStocks as $stock) {
            $product = Product::where('id', $stock->product_id)->first();
            if (!empty($product)) {
                $productUnitName = BaseUnit::whereId($product->product_unit)->value('name');
                $stock['product_unit_name'] = $productUnitName;
                $product->stock = $stock;
                $productResponse[] = $product;
                $product = null;
                $stock = null;
            }
        }

        return $this->sendResponse($productResponse, 'Stocks retrieved successfully');
    }
}
