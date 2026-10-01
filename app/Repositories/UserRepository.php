<?php

namespace App\Repositories;

use App\Models\MultiTenant;
use App\Models\Role;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class UserRepository
 */
class UserRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'created_at',
        //        'roles.name',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return User::class;
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function storeUser($input)
    {
        try {
            DB::beginTransaction();
            $input['password'] = Hash::make($input['password']);
            $input['email_verified_at'] = now();
            $input['tenant_id'] = currentTenantId();
            $user = $this->create($input);
            if (isset($input['role_id'])) {
                $user->assignRole($input['role_id']);
            }
            if (isset($input['image']) && ! empty($input['image'])) {
                $user->addMedia($input['image'])->toMediaCollection(
                    User::PATH,
                    config('app.media_disc')
                );
            }

            $storesIds = [];
            $storesTenantIds = [];
            if (!empty($input['stores']) && is_string($input['stores'])) {
                $input['stores'] = array_filter(array_map('trim', explode(',', $input['stores'])));
                $input['stores'] = array_values($input['stores']);
                $stores = Store::whereIn('id', $input['stores'])->get();
                $storesIds = $stores->pluck('id')->toArray();
                $storesTenantIds = $stores->pluck('tenant_id')->toArray();
            }
            UserStore::where('user_id', $user->id)->delete();
            if($storesIds){
                foreach ($storesIds as $storeId) {
                    UserStore::create([
                        'user_id' => $user->id,
                        'store_id' => $storeId,
                    ]);
                }
            }

            $warehousesIds = [];
            if (!empty($input['warehouse']) && is_string($input['warehouse']) && !empty($storesTenantIds)) {
                $input['warehouse'] = array_filter(array_map('trim', explode(',', $input['warehouse'])));
                $input['warehouse'] = array_values($input['warehouse']);
                $warehouses = Warehouse::withoutGlobalScope('tenant')->whereIn('tenant_id', $storesTenantIds)->whereIn('id', $input['warehouse'])->get();
                $warehousesIds = $warehouses->pluck('id')->toArray();
            }
            UserWarehouse::where('user_id', $user->id)->delete();
            if($warehousesIds){
                foreach ($warehousesIds as $warehouseId) {
                    UserWarehouse::create([
                        'user_id' => $user->id,
                        'warehouse_id' => $warehouseId,
                    ]);
                }
            }

            if($storesIds){
                $store = Store::find($storesIds[0]);
                $user->update([
                    'tenant_id' => $store->tenant_id,
                ]);
            }

            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function updateUser($input, $id)
    {
        try {
            DB::beginTransaction();
            $input['tenant_id'] = currentTenantId();
            $user = $this->update($input, $id);

            if (isset($input['role_id'])) {
                $user->syncRoles($input['role_id']);
            }
            if (isset($input['image']) && $input['image']) {
                $user->clearMediaCollection(User::PATH);
                $user['image_url'] = $user->addMedia($input['image'])->toMediaCollection(
                    User::PATH,
                    config('app.media_disc')
                );
            }

            $storesIds = [];
            $storesTenantIds = [];
            if (!empty($input['stores']) && is_string($input['stores'])) {
                $input['stores'] = array_filter(array_map('trim', explode(',', $input['stores'])));
                $input['stores'] = array_values($input['stores']);
                $stores = Store::whereIn('id', $input['stores'])->get();
                $storesIds = $stores->pluck('id')->toArray();
                $storesTenantIds = $stores->pluck('tenant_id')->toArray();
            }
            UserStore::where('user_id', $user->id)->delete();
            if($storesIds){
                foreach ($storesIds as $storeId) {
                    UserStore::create([
                        'user_id' => $user->id,
                        'store_id' => $storeId,
                    ]);
                }
            }

            $warehousesIds = [];
            if (!empty($input['warehouse']) && is_string($input['warehouse']) && !empty($storesTenantIds)) {
                $input['warehouse'] = array_filter(array_map('trim', explode(',', $input['warehouse'])));
                $input['warehouse'] = array_values($input['warehouse']);
                $warehouses = Warehouse::withoutGlobalScope('tenant')->whereIn('tenant_id', $storesTenantIds)->whereIn('id', $input['warehouse'])->get();
                $warehousesIds = $warehouses->pluck('id')->toArray();
            }
            UserWarehouse::where('user_id', $user->id)->delete();
            if($warehousesIds){
                foreach ($warehousesIds as $warehouseId) {
                    UserWarehouse::create([
                        'user_id' => $user->id,
                        'warehouse_id' => $warehouseId,
                    ]);
                }
            }

            if ($storesTenantIds && !in_array($user->tenant_id, $storesTenantIds)) {
                $user->update([
                    'tenant_id' => $storesTenantIds[0] ?? currentTenantId()
                ]);
            }


            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return User|\Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function updateUserProfile($input)
    {
        try {
            DB::beginTransaction();
            unset($input['role_id']);

            $user = Auth::user();
            $user->update($input);

            if ((! empty($input['image']))) {
                $user->clearMediaCollection(User::PATH);
                $user->media()->delete();
                $user->addMedia($input['image'])->toMediaCollection(User::PATH, config('app.media_disc'));
            }
            DB::commit();

            return $user;
        } catch (\Exception $e) {
            DB::rollBack();

            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function getUsers($perPage)
    {
        $loginUserId = Auth::id();
        $returnAll = request()->get('returnAll') == 'true';

        if (Auth::user()->hasRole(Role::ADMIN)) {
            $userStore = UserStore::where('user_id', $loginUserId)->first();
            $storeUserId = $userStore ? $userStore->store->user_id : $loginUserId;

            $allStoreTenants = Store::where('user_id', $storeUserId)->pluck('tenant_id')->toArray();

            if (!empty($allStoreTenants)) {
                $query = $this->withoutGlobalScope('tenant')
                    ->whereIn('tenant_id', $allStoreTenants);
            } else {
                $query = $this;
            }

            if (!$returnAll) {
                $query->where('id', '!=', $loginUserId);
            }

            if($perPage == 0){
                return $query->get();
            }

            return $query->paginate($perPage);
        }

        // Non-admin users
        $query = $this->whereHas('roles', function ($q) {
            $q->where('name', '!=', Role::ADMIN);
        });

        if (!$returnAll) {
            $query->where('id', '!=', Auth::id());
        }

        return $query->paginate($perPage);
    }

    public function updatePassword(array $input): User
    {
        /** @var User $user */
        $user = Auth::user();
        if (! Hash::check($input['current_password'], $user->password)) {
            throw new UnprocessableEntityHttpException(__('messages.error.current_password_not_match'));
        }
        $input['password'] = Hash::make($input['new_password']);
        $user->update($input);

        return $user;
    }
    public function updateUserPassword(array $input): User
    {
        /** @var User $user */
        $currentLoggedInUser = Auth::user();
        $user = $this->withoutGlobalScope('tenant')->find(id: $input['user_id']);

        if($user->roles[0]->name == Role::SUPER_ADMIN){
            throw new UnprocessableEntityHttpException(__('messages.error.user_cant_updated'));
        }
        if($user->id == $currentLoggedInUser->id){
            throw new UnprocessableEntityHttpException(__('messages.error.user_cant_updated'));
        }
        $input['password'] = Hash::make($input['password']);
        $user->update($input);

        return $user;
    }
}
