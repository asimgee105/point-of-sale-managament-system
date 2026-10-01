<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateStoreRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Http\Resources\StoreCollection;
use App\Http\Resources\StoreResource;
use App\Models\MultiTenant;
use Illuminate\Http\Request;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserStore;
use App\Models\Warehouse;
use App\Repositories\StoreRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class StoreAPIController extends AppBaseController
{
    /** @var StoreRepository */
    private $storeRepository;

    public function __construct(StoreRepository $storeRepository)
    {
        $this->storeRepository = $storeRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): StoreCollection
    {
        $perPage = getPageSize($request);
        $userStores = UserStore::where('user_id', auth()->id())->pluck('store_id')->toArray();
        if (!empty($userStores)) {
            $stores = $this->storeRepository->whereIn('id', $userStores)->paginate($perPage);
        } else {
            $stores = $this->storeRepository->where('user_id', auth()->id())->paginate($perPage);
        }        
         
        StoreResource::usingWithCollection();

        return new StoreCollection($stores);
    }

    public function getStoresWarehouses(): JsonResponse
    {
        $authUser = Auth::user();

        $userStoreIds = UserStore::where('user_id', $authUser->id)
            ->pluck('store_id')
            ->toArray();

        if (!empty($userStoreIds)) {
            $stores = Store::whereIn('id', $userStoreIds)->get();
        } else {
            $stores = Store::where('user_id', $authUser->id)->get();
        }

        $data = $stores->map(function ($store) use ($authUser) {

            $warehouses = Warehouse::withoutGlobalScope('tenant')->where('tenant_id', $store->tenant_id)->get();

            return [
                'id' => $store->id,
                'attributes' => [
                    'name' => $store->name,
                    'tenant_id' => $store->tenant_id,
                    'status' => $store->status,
                    'users' => UserStore::where('store_id', $store->id)->count(),
                    'active' => $authUser->tenant_id === $store->tenant_id,
                    'warehouse' => $warehouses->map(function ($warehouse) {
                        return [
                            'id' => $warehouse->id,
                            'name' => $warehouse->name,
                        ];
                    })->values(),
                ]
            ];
        })->values();

        return response()->json([
            'data' => $data
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateStoreRequest $request)
    {
        $input = $request->all();

        $store = $this->storeRepository->store($input);

        return new StoreResource($store);
    }

    /**
     * Display the specified resource.
     */
    public function show(Store $store)
    {
        Session::put('active_store', $store->id);

        return new StoreResource($store);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStoreRequest $request, Store $store)
    {
        $input = $request->all();

        $store = $this->storeRepository->updateStore($input, $store->id);

        return new StoreResource($store);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Store $store)
    {
        try {
            $this->storeRepository->deleteStore($store->id);

            return $this->sendSuccess(__('messages.success.store_deleted'));
        } catch (Exception $exception) {
            return $this->sendError($exception->getMessage());
        }
    }

    public function changeStore(Store $store)
    {
        try {
            User::find(auth()->id())->update(['tenant_id' => $store->tenant_id]);

            return $this->sendSuccess(__('messages.success.active_store_changed'));
        } catch (Exception $exception) {
            return $this->sendError($exception->getMessage());
        }
    }

    public function changeStatus(Store $store)
    {
        try {
            if ($store->user == null) {
                return $this->sendError(__('messages.error.cannot_change_store_status'));
            }

            if ($store->tenant_id == $store->user->tenant_id) {
                return $this->sendError(__('messages.error.cannot_deactivate_active_store'));
            }

            if ($store->status) {
                $userStore = UserStore::where('store_id', $store->id)->exists();
                if ($userStore) {
                    return $this->sendError(__('messages.error.cannot_disable_already_assigned_store'));
                }
            } else {
                $currentSubscription = Subscription::where('user_id', $store->user->id)->where('status', Subscription::ACTIVE)->first();
                $storeLimit = $currentSubscription->plan->no_of_stores ?? 0;
                $activeStores = Store::where('user_id', $store->user->id)->where('status', 1)->count();
                if ($activeStores >= $storeLimit) {
                    return $this->sendError(__('messages.error.cannot_activate_store_plan_limit'));
                }
            }

            $store->status = !$store->status;
            $store->save();

            return $this->sendSuccess(__('messages.success.store_status_changed'));
        } catch (Exception $exception) {
            return $this->sendError($exception->getMessage());
        }
    }
}
