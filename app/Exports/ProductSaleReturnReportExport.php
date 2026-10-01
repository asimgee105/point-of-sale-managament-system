<?php

namespace App\Exports;

use App\Models\SaleReturn;
use Maatwebsite\Excel\Concerns\FromView;

class ProductSaleReturnReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $productId = request()->get('product_id');

        $saleReturns = SaleReturn::with(['customer', 'warehouse', 'saleReturnItems.product'])
            ->whereHas('customer')
            ->whereHas('warehouse');

        if ($productId) {
            $saleReturns->whereHas('saleReturnItems', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            });
        }

        if (!isAdmin()) {
            $saleReturns->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        $saleReturns = $saleReturns->orderBy('id', 'desc')->get();

        return view('excel.product-sale-returns-report-excel', [
            'saleReturns' => $saleReturns,
            'productId' => $productId
        ]);
    }
}