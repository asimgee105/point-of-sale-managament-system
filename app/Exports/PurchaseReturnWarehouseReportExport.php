<?php

namespace App\Exports;

use App\Models\PurchaseReturn;
use Maatwebsite\Excel\Concerns\FromView;

class PurchaseReturnWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');
        $supplierId = request()->get('supplier_id');
        $status = request()->get('status') ?? null;

        $purchaseReturns = PurchaseReturn::with(['warehouse', 'supplier'])->whereHas('warehouse')->whereHas('supplier');
        
        if (!isAdmin()) {
            $purchaseReturns->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if ($warehouseId && $warehouseId != 'all' && $warehouseId != 'null') {
            $purchaseReturns->where('warehouse_id', $warehouseId);
        }

        if ($status && $status != 'null' && $status != 'all') {
            $purchaseReturns->where('status', $status);
        }

        if ($supplierId && $supplierId != 'all' && $supplierId != 'null') {
            $purchaseReturns->where('supplier_id', $supplierId);
        }
        
        $purchaseReturns = $purchaseReturns->orderBy('id', 'desc')->get();

        return view('excel.purchase-return-report-excel', ['purchaseReturns' => $purchaseReturns]);
    }
}
