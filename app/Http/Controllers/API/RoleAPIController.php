<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleCollection;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use App\Repositories\RoleRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleAPIController extends AppBaseController
{
    /**
     * @var RoleRepository
     */
    private $roleRepository;

    public function __construct(RoleRepository $roleRepository)
    {
        $this->roleRepository = $roleRepository;
    }

    public function index(Request $request): RoleCollection
    {
        $perPage = getPageSize($request);
        $user = Auth::user();
        if ($user->hasRole(Role::ADMIN) && $user->subscriptions->count() > 0) {
            $stores = Store::where('user_id', $user->id)->pluck('tenant_id')->toArray();
            $roles = $this->roleRepository->withoutGlobalScope('tenant')->whereIn('tenant_id', $stores)->orWhere('name', Role::ADMIN)->paginate($perPage);
        } else {
            $userStore = UserStore::where('user_id', $user->id)->first();
            if ($userStore && $userStore->store) {
                $stores = Store::where('user_id', $userStore->store->user_id)->pluck('tenant_id')->toArray();
                $roles = $this->roleRepository->withoutGlobalScope('tenant')->whereIn('tenant_id', $stores)->orWhere('name', Role::ADMIN)->paginate($perPage);
            } else {
                $roles = $this->roleRepository->withoutGlobalScope('tenant')->where('tenant_id', $user->tenant_id)->orWhere('name', Role::ADMIN)->paginate($perPage);
            }
        }

        RoleResource::usingWithCollection();

        return new RoleCollection($roles);
    }

    public function store(CreateRoleRequest $request): RoleResource
    {
        $input = $request->all();
        $role = $this->roleRepository->storeRole($input);

        return new RoleResource($role);
    }

    public function show($role): RoleResource
    {
        $role = $this->roleRepository->withoutGlobalScope('tenant')->findOrFail($role);
        return new RoleResource($role);
    }

    /**
     * @return RoleResource|JsonResponse
     */
    public function update(UpdateRoleRequest $request, $role)
    {
        $role = $this->roleRepository->withoutGlobalScope('tenant')->findOrFail($role);

        if ($role->name == Role::ADMIN) {
            return $this->sendError('Admin role Can\'t be updated.');
        }
        if ($role->name == Role::SUPER_ADMIN) {
            return $this->sendError('Super Admin role Can\'t be updated.');
        }

        $input = $request->all();
        $role = $this->roleRepository->updateRole($input, $role->id);

        return new RoleResource($role);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request.');
        }

        if (count($ids) === 1) {
            /** @var Role $role */
            $role = Role::withoutGlobalScope('tenant')->findOrFail($ids[0]);
            if ($role->users->count()) {
                return $this->sendError(__('messages.error.role_cant_delete', ['role' => $role->display_name]));
            }
            $role->delete();

            return $this->sendSuccess('Role deleted successfully');
        }

        $cannotDelete = [];
        foreach ($ids as $id) {
            try {
                /** @var Role $role */
                $role = Role::withoutGlobalScope('tenant')->findOrFail($id);

                if ($role->users->count()) {
                    $cannotDelete[] = [
                        'id' => $id,
                        'name' => $role->display_name,
                    ];
                    continue;
                }

                $role->delete();
            } catch (Exception $e) {
                $cannotDelete[] = ['id' => $id, 'name' => 'Unknown or Error'];
            }
        }
        return $this->sendResponse([
            'show_model' => count($cannotDelete) > 0,
            'ids' => $cannotDelete,
        ], 'Role delete process completed.');
    }
}
