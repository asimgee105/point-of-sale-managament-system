<?php

namespace App\Exports;

use App\Models\SaleReturn;
use Maatwebsite\Excel\Concerns\FromView;

class SaleReturnWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id') ?? null;
        $status = request()->get('status') ?? null;

        $saleReturns = SaleReturn::with(['warehouse', 'customer'])->whereHas('warehouse')->whereHas('customer');

        if (!isAdmin()) {
            $saleReturns->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if ($warehouseId && $warehouseId != 'all' && $warehouseId != 'null') {
            $saleReturns->where('warehouse_id', $warehouseId);
        }

        if ($status && $status != 'null' && $status != 'all') {
            $saleReturns->where('status', $status);
        }

        $saleReturns = $saleReturns->orderBy('id', 'desc')->get();

        return view('excel.sale-return-report-excel', ['saleReturns' => $saleReturns]);
    }
}
