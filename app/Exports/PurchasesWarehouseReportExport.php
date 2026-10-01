<?php

namespace App\Exports;

use App\Models\Purchase;
use Maatwebsite\Excel\Concerns\FromView;

class PurchasesWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id') ?? null;
        $supplierId = request()->get('supplier_id') ?? null;
        $status = request()->get('status') ?? null;

        $purchases = Purchase::with(['warehouse', 'supplier'])->whereHas('warehouse')->whereHas('supplier');

        if (!isAdmin()) {
            $purchases->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if ($warehouseId && $warehouseId != 'all' && $warehouseId != 'null') {
            $purchases->where('warehouse_id', $warehouseId);
        }

        if ($supplierId && $supplierId != 'all' && $supplierId != 'null') {
            $purchases->where('supplier_id', $supplierId);
        }

        if ($status && $status != 'null' && $status != 'all') {
            $purchases->where('status', $status);
        }

        $purchases = $purchases->orderBy('id', 'desc')->get();

        return view('excel.purchase-report-excel', ['purchases' => $purchases]);
    }
}
