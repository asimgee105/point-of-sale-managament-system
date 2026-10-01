<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromView;

class ProductSaleReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $productId = request()->get('product_id');

        $sales = Sale::with(['customer', 'warehouse', 'saleItems.product'])
            ->whereHas('customer')
            ->whereHas('warehouse');

        if ($productId) {
            $sales->whereHas('saleItems', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        if (!isAdmin()) {
            $sales->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        $sales = $sales->orderBy('id', 'desc')->get();

        return view('excel.product-sale-report-excel', [
            'sales' => $sales,
            'productId' => $productId
        ]);
    }
}