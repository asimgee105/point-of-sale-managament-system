<?php

namespace App\Exports;

use App\Models\ManageStock;
use Maatwebsite\Excel\Concerns\FromView;

class StockReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');
        $search = request()->get('search');
        $stocks = ManageStock::with(['product.productCategory', 'warehouse']);
        if (!isAdmin()) {
            $stocks->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }
        if ($warehouseId && $warehouseId != 'undefined' && $warehouseId != 'null' && $warehouseId != 'all') {
            $stocks->where('warehouse_id', $warehouseId);
        }
        if ($search && $search != 'null') {
            $stocks->where(function ($q) use ($search) {
                $q->whereHas('product', function ($query) use ($search) {
                    $query->where(function ($sub) use ($search) {
                        $sub->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('code', 'LIKE', "%{$search}%");
                    });
                })
                ->orWhereHas('product.productCategory', function ($query) use ($search) {
                    $query->where('name', 'LIKE', "%{$search}%");
                });
            });
        }

        $stocks = $stocks->orderBy('id', 'desc')->get();

        return view('excel.stock-report-excel', ['stocks' => $stocks]);
    }
}
