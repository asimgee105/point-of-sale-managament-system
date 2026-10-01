<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromView;

class SaleReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $startDate = request()->get('start_date');
        $endDate   = request()->get('end_date');
        $userId    = request()->get('user_id');
        $paymentStatus = request()->get('payment_status') ?? null;
        $status    = request()->get('status') ?? null;

        $query = Sale::with(['saleItems', 'warehouse', 'customer', 'payments'])
            ->whereHas('customer')
            ->whereHas('warehouse');

        if (!isAdmin()) {
            $query->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }

        if ($userId && $userId != 'null') {
            $query->where('user_id', $userId);
        }
        
        if ($startDate != 'null' && $endDate != 'null' && $startDate && $endDate) {
            $query->whereDate('created_at', '>=', $startDate)
                  ->whereDate('created_at', '<=', $endDate);
        }

        if ($status && $status != 'null' && $status != 'all') {
            $query->where('status', $status);
        }

        if ($paymentStatus && $paymentStatus != 'null' && $paymentStatus != 'all') {
            $query->where('payment_status', $paymentStatus);
        }

        $sales = $query->orderBy('id', 'desc')->get();

        return view('excel.all-sale-report-excel', ['sales' => $sales]);
    }
}
