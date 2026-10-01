<?php

namespace App\Repositories;

use App\Models\BaseUnit;
use App\Models\Customer;
use App\Models\MailTemplate;
use App\Models\MultiTenant;
use App\Models\Setting;
use App\Models\SmsSetting;
use App\Models\SmsTemplate;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\UserStore;
use App\Models\Warehouse;
use Exception;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class StoreRepository
 */
class StoreRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
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
        return Store::class;
    }

    public function store($input)
    {
        try {
            DB::beginTransaction();

            $store = Store::create([
                'name' => $input['name'],
                'user_id' => Auth::id(),
            ]);

            $tenant = MultiTenant::create(['store_id' => $store->id]);

            $store->update(['tenant_id' => $tenant->id]);

            App::make(AdminRepository::class)->defaultSettings($tenant->id);

            DB::commit();
            return $store;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function updateStore($input, $storeId)
    {
        try {
            DB::beginTransaction();

            $store = Store::find($storeId);
            $store->update([
                'name' => $input['name'],
            ]);

            DB::commit();
            return $store;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function deleteStore($storeId)
    {
        try {
            DB::beginTransaction();

            $store = Store::find($storeId);
            $tenant = MultiTenant::where('id', $store->tenant_id)
                ->where('store_id', $store->id)
                ->first();

            if ($tenant) {
                $user = Auth::user();
                if ($user->tenant_id == $tenant->id) {
                    throw new UnprocessableEntityHttpException(__('messages.error.cannot_delete_active_store'));
                }

                if (UserStore::where('store_id', $store->id)->exists()) {
                    throw new UnprocessableEntityHttpException(__('messages.error.cannot_delete_assigned_store'));
                }

                if (Subscription::where('user_id', $user->id)->where('status', Subscription::PENDING)->exists()) {
                    throw new UnprocessableEntityHttpException(__('messages.error.cannot_delete_store_with_pending_payment'));
                }

                $tenant->deleteDatabaseIfExists();

                $tenant->unsetEventDispatcher();
                $tenant->forceDelete();
            }

            DB::commit();
            return true;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }
}
