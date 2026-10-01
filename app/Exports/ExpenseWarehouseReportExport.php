<?php

namespace App\Exports;

use App\Models\Expense;
use Maatwebsite\Excel\Concerns\FromView;

class ExpenseWarehouseReportExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $warehouseId = request()->get('warehouse_id');

        $query = Expense::with('warehouse', 'expenseCategory', 'user')->has('warehouse');

        if (!isAdmin()) {
            $query->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }
        
        if (isset($warehouseId) && $warehouseId != 'null' && $warehouseId != 'undefined' && $warehouseId != 'all') {
            $query->whereWarehouseId($warehouseId);
        }

        $expenses = $query->with([
            'warehouse',
            'expenseCategory',
            'user' => function ($query) {
                $query->withoutGlobalScope('tenant');
            }
        ])->get();

        return view('excel.expense-report-excel', ['expenses' => $expenses]);
    }
}
