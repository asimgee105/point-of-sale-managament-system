<?php

namespace App\Exports;

use App\Models\Product;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromView;

class TopSellingProductReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $query = Product::leftJoin('sale_items', 'products.id', '=', 'sale_items.product_id');

        if (!isAdmin()) {
            $query->whereHas('stock', function ($q) {
                $q->whereIn('manage_stocks.warehouse_id', getLoginUserWarehouseIds());
            });
        }

        if (request()->get('start_date') && request()->get('start_date') != 'null') {
            $startDate = Carbon::parse(request()->get('start_date'))->startOfDay()->toDateTimeString();
            $endDate = Carbon::parse(request()->get('end_date'))->endOfDay()->toDateTimeString();

            $query->whereBetween('sale_items.created_at', [$startDate, $endDate]);
        }

        $topSelling = $query
            ->selectRaw('products.*, COALESCE(SUM(sale_items.sub_total),0) as grand_total')
            ->selectRaw('COALESCE(SUM(sale_items.quantity),0) as total_quantity')
            ->groupBy('products.id')
            ->orderBy('total_quantity', 'desc')
            ->get();

        $topSellingProducts = [];
        foreach ($topSelling as $item) {
            $topSellingProducts[] = $item->prepareTopSellingReport();
        }

        return view('excel.top-selling-product-report-excel', [
            'topSellingProducts' => $topSellingProducts
        ]);
    }
}