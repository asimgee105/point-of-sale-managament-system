<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromView;

class ProductExcelExport implements FromView
{
    public function view(): \Illuminate\Contracts\View\View
    {
        $baseUnit = request()->get('base_unit') ?? null;
        $productCategoryId = request()->get('product_category_id') ?? null;
        $brandId = request()->get('brand_id') ?? null;
        
        $query = Product::with([
            'productCategory',
            'brand',
            'stock',
            'variationProduct.variation',
            'variationProduct.variationType'
        ]);

        if (!isAdmin()) {
            $query->whereHas('stock', function ($q) {
                $q->whereIn('manage_stocks.warehouse_id', getLoginUserWarehouseIds());
            });
        }

        if ($baseUnit && $baseUnit != 'null' && $baseUnit != 'undefined' && $baseUnit != 'all') {
            $query->where('product_unit', $baseUnit);
        }

        if ($productCategoryId && $productCategoryId != 'null' && $productCategoryId != 'undefined' && $productCategoryId != 'all') {
            $query->where('product_category_id', $productCategoryId);
        }

        if ($brandId && $brandId != 'null' && $brandId != 'undefined' && $brandId != 'all') {
            $query->where('brand_id', $brandId);
        }

        $products = $query->orderBy('id', 'desc')->get();

        return view('excel.product-excel-export', ['products' => $products]);
    }
}
