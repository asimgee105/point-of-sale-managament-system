<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ManageStockCollection;
use App\Http\Resources\ManageStockResource;
use App\Repositories\ManageStockRepository;
use Illuminate\Http\Request;

/**
 * Class UserAPIController
 */
class ManageStockAPIController extends AppBaseController
{
    private $manageStockRepository;

    public function __construct(ManageStockRepository $manageStockRepository)
    {
        $this->manageStockRepository = $manageStockRepository;
    }

    public function stockReport(Request $request): ManageStockCollection
    {
        $request->request->remove('filter');
        $perPage = getPageSize($request);
        $search = $request->get('search');
        $warehouseId = $request->get('warehouse_id');
        $stocks = \App\Models\ManageStock::with(['product.productCategory'])->whereHas('product');
        if(!isAdmin()){
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
        $stocks = $stocks->paginate($perPage);
        ManageStockResource::usingWithCollection();

        return new ManageStockCollection($stocks);
    }
}
