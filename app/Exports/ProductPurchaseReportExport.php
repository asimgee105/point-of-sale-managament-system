<?php

namespace App\Exports;

use App\Models\Purchase;
use Maatwebsite\Excel\Concerns\FromView;

class ProductPurchaseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $productId = request()->get('product_id');

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

        $purchases = $purchases->orderBy('id', 'desc')->get();

        return view('excel.product-purchases-report-excel', [
            'purchases' => $purchases,
            'productId' => $productId
        ]);
    }
}