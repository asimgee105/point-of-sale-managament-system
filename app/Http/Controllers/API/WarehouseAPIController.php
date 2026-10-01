<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Http\Resources\WarehouseCollection;
use App\Http\Resources\WarehouseResource;
use App\Models\ManageStock;
use App\Models\Purchase;
use App\Models\PurchaseReturn;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use App\Repositories\WarehouseRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Prettus\Validator\Exceptions\ValidatorException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class WarehouseAPIController
 */
class WarehouseAPIController extends AppBaseController
{
    /**
     * @var WarehouseRepository
     */
    private $warehouseRepository;

    public function __construct(WarehouseRepository $warehouseRepository)
    {
        $this->warehouseRepository = $warehouseRepository;
    }

    public function index(Request $request): WarehouseCollection
    {
        $perPage = getPageSize($request);
        $search = $request->filter['search'] ?? null;

        $warehouses = Warehouse::query();

        if (!isAdmin()) {
            $warehouses->whereIn('id', getLoginUserWarehouseIds());
        }

        if ($search) {
            $warehouses->where(function ($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%")
                    ->orWhere('country', 'LIKE', "%{$search}%")
                    ->orWhere('city', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('zip_code', 'LIKE', "%{$search}%");
            });
        }

        $warehouses = $warehouses->paginate($perPage);

        WarehouseResource::usingWithCollection();

        return new WarehouseCollection($warehouses);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateWarehouseRequest $request): WarehouseResource
    {
        $input = $request->all();
        $warehouse = $this->warehouseRepository->create($input);

        return new WarehouseResource($warehouse);
    }

    public function warehouseDetails($id)
    {
        $warehouses = ManageStock::where('warehouse_id', $id)->with('product')->get();

        $products = [];

        foreach ($warehouses as $warehouse) {
            $products[] = $warehouse->prepareWarehouseAttributes();
        }

        return $this->sendResponse($products, 'Products Retrived Successfully');
    }

    public function show($id): WarehouseResource
    {
        $warehouse = $this->warehouseRepository->find($id);

        return new WarehouseResource($warehouse);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateWarehouseRequest $request, $id): WarehouseResource
    {
        $input = $request->all();
        $warehouse = $this->warehouseRepository->update($input, $id);

        return new WarehouseResource($warehouse);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request format.');
        }

        try {
            if (count($ids) === 1) {
                DB::beginTransaction();

                if (getSettingValue('default_warehouse') == $ids[0]) {
                    return $this->sendError(__('messages.error.default_warehouse_cant_delete'));
                }

                if ($this->warehouseRepository->warehouseCanDelete($ids[0])) {
                    return $this->sendError(__('messages.error.warehouse_cant_delete'));
                }

                $this->warehouseRepository->delete($ids[0]);
                DB::commit();
                return $this->sendSuccess('Warehouse deleted successfully');
            }

            $cannotDelete = [];
            foreach ($ids as $id) {
                DB::beginTransaction();

                if (getSettingValue('default_warehouse') == $id || $this->warehouseRepository->warehouseCanDelete($id)) {
                    $cannotDelete[] = [
                        'id' => $id,
                        'name' => $this->warehouseRepository->find($id)->name ?? 'Unnamed Warehouse'
                    ];
                    DB::rollBack();
                    continue;
                }

                $this->warehouseRepository->delete($id);
                DB::commit();
            }

            return $this->sendResponse([
                'show_model' => count($cannotDelete) > 0,
                'ids' => $cannotDelete,
            ], 'Warehouse delete process completed.');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function warehouseReport(Request $request)
    {
        $report = [];
        $saleCount = Sale::whereHas('warehouse');
        $purchaseCount = Purchase::whereHas('warehouse');
        $saleReturnCount = SaleReturn::whereHas('warehouse');
        $purchaseReturnCount = PurchaseReturn::whereHas('warehouse');

        if(!isAdmin()){
            $saleCount->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $purchaseCount->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $saleReturnCount->whereIn('warehouse_id', getLoginUserWarehouseIds());
            $purchaseReturnCount->whereIn('warehouse_id', getLoginUserWarehouseIds());
        }
        
        if ($request->get('warehouse_id') && ! empty($request->get('warehouse_id')) && $request->get('warehouse_id') != 'all' && $request->get('warehouse_id') != 'null') {
            $saleCount->whereWarehouseId($request->get('warehouse_id'));
            $purchaseCount->whereWarehouseId($request->get('warehouse_id'));
            $saleReturnCount->whereWarehouseId($request->get('warehouse_id'));
            $purchaseReturnCount->whereWarehouseId($request->get('warehouse_id'));
        }

        $report['sale_count'] = $saleCount->count();
        $report['purchase_count'] = $purchaseCount->count();
        $report['sale_return_count'] = $saleReturnCount->count();
        $report['purchase_return_count'] = $purchaseReturnCount->count();

        return $this->sendResponse($report, '');
    }
}
