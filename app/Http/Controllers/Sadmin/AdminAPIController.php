<?php

namespace App\Http\Controllers\Sadmin;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\MultiTenant;
use App\Models\Store;
use App\Models\User;
use App\Repositories\AdminRepository;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Class AdminAPIController
 */
class AdminAPIController extends AppBaseController
{
    /** @var AdminRepository */
    private $adminRepository;

    public function __construct(AdminRepository $adminRepository)
    {
        $this->adminRepository = $adminRepository;
    }

    public function index(Request $request): UserCollection
    {
        $perPage = getPageSize($request);
        $admins = $this->adminRepository->getUsers($perPage);
        UserResource::usingWithCollection();

        return new UserCollection($admins);
    }

    public function store(CreateAdminRequest $request): UserResource
    {
        $input = $request->all();
        $admin = $this->adminRepository->storeAdmin($input);

        return new UserResource($admin);
    }

    public function show($adminUser): UserResource
    {
        $user = User::withoutGlobalScope('tenant')->findOrFail($adminUser);
        return new UserResource($user);
    }

    /**
     * @return UserResource|JsonResponse
     */
    public function update(UpdateAdminRequest $request, $adminUser)
    {
        $user = User::withoutGlobalScope('tenant')->findOrFail($adminUser);
        $input = $request->all();
        $admin = $this->adminRepository->updateAdmin($input, $user);

        return new UserResource($admin);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids)) {
            return $this->sendError('Invalid request format.');
        }

        try {
            DB::beginTransaction();

            foreach ($ids as $id) {
                $user = User::withoutGlobalScope('tenant')->findOrFail($id);

                $stores = Store::where('user_id', $user->id)->get();
                foreach ($stores as $store) {
                    $tenant = MultiTenant::where('id', $store->tenant_id)
                        ->where('store_id', $store->id)
                        ->first();
                    if ($tenant) {
                        $tenant->deleteDatabaseIfExists();

                        $tenant->unsetEventDispatcher();
                        $tenant->forceDelete();
                    }
                    $store->delete();
                }

                $user->delete();
            }

            DB::commit();
            $message = count($ids) === 1 ? 'User deleted successfully' : 'Users deleted successfully';
            return $this->sendSuccess($message);
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    public function emailVerify($adminUser): JsonResponse
    {
        $user = User::withoutGlobalScope('tenant')->findOrFail($adminUser);
        $user->email_verified_at = now();
        $user->save();

        return $this->sendSuccess('Email verified successfully');
    }

    public function statusUpdate($adminUser): JsonResponse
    {
        $user = User::withoutGlobalScope('tenant')->findOrFail($adminUser);
        $user->status = $user->status == 1 ? 0 : 1;
        $user->save();

        return $this->sendSuccess(__('messages.success.status_updated'));
    }
}
