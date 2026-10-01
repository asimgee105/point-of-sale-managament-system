<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromView;

class SalesWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id') ?? null;
        $paymentStatus = request()->get('payment_status') ?? null;
        $status = request()->get('status') ?? null;

        $sales = Sale::with(['customer', 'warehouse'])
            ->whereHas('customer')
            ->whereHas('warehouse');

        if (!isAdmin()) {
            $sales->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if ($warehouseId && $warehouseId != 'all' && $warehouseId != 'null') {
            $sales->where('warehouse_id', $warehouseId);
        }

        if ($status && $status != 'null' && $status != 'all') {
            $sales->where('status', $status);
        }

        if ($paymentStatus && $paymentStatus != 'null' && $paymentStatus != 'all') {
            $sales->where('payment_status', $paymentStatus);
        }

        $sales = $sales->orderBy('id', 'desc')->get();

        return view('excel.sale-report-excel', [
            'sales' => $sales
        ]);
    }
}
