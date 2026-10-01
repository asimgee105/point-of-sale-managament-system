<?php

namespace App\Http\Controllers\Sadmin;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\SubscriptionCollection;
use App\Http\Resources\SubscriptionResource;
use App\Http\Resources\TransactionCollection;
use App\Http\Resources\TransactionResource;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserStore;
use App\Repositories\SubscriptionRepository;
use App\Repositories\TransactionRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

/**
 * Class SubscriptionAPIController
 */
class SubscriptionAPIController extends AppBaseController
{
    /** @var SubscriptionRepository */
    private $subscriptionRepository;

    public function __construct(SubscriptionRepository $subscriptionRepository)
    {
        $this->subscriptionRepository = $subscriptionRepository;
    }

    public function getActiveSubscriptions(Request $request): SubscriptionCollection
    {
        $perPage = getPageSize($request);
        $filter = $request->get('filter') ?? null;
        $filter['status'] = $request->get('status') ?? null;
        $filter['payment_type'] = $request->get('payment_type') ?? null;
        $filter['plan_type'] = $request->get('plan_type') ?? null;
        $subscriptions = $this->subscriptionRepository->getActiveSubscriptions($perPage, $filter);

        SubscriptionResource::usingWithCollection();

        return new SubscriptionCollection($subscriptions);
    }

    public function getCashPaymentRequests(Request $request): SubscriptionCollection
    {
        $perPage = getPageSize($request);
        $filter = $request->get('filter') ?? null;
        $status = $request->get('status') ?? null;
        $subscriptions = $this->subscriptionRepository->getManualSubscriptions($perPage, $filter, $status);
        SubscriptionResource::usingWithCollection();

        return new SubscriptionCollection($subscriptions);
    }

    public function show(Subscription $subscription): SubscriptionResource
    {
        return new SubscriptionResource($subscription);
    }

    public function updateStatus(Request $request, Subscription $subscription)
    {
        $validated = $request->validate([
            'status' => 'required',
        ]);

        if ($subscription->status == Subscription::PENDING) {
            $storeUser = User::withoutGlobalScope('tenant')->find($subscription->user_id);
            $userStores = Store::where('user_id', $subscription->user_id)->get();

            if ($subscription->data) {
                $decodedData = json_decode($subscription->data);
                $dataActiveStore = null;
                $activeStoreTenantId = $decodedData->active_store ?? null;
                $dataStores = $decodedData->stores ?? [];
                if ($activeStoreTenantId) {
                    $dataActiveStore = Store::where('tenant_id', $activeStoreTenantId)->first();
                }

                if ($dataStores) {
                    Store::where('user_id', $subscription->user_id)
                        ->whereNotIn('id', $dataStores)
                        ->update(['status' => 0]);

                    if ($dataActiveStore) {
                        $dataActiveStore->update(['status' => 1]);
                        $storeUser->update(['tenant_id' => $dataActiveStore->tenant_id]);
                    }

                    $disabledStores = Store::where('user_id', $subscription->user_id)->where('status', 0)->get();
                    foreach ($disabledStores as $store) {
                        UserStore::where('store_id', $store->id)->delete();
                        $disabledStoresUsers = User::where('tenant_id', $store->tenant_id)->get();
                        foreach ($disabledStoresUsers as $disabledStoreUser) {
                            $firstActiveStore = UserStore::where('user_id', $disabledStoreUser->id)->first();
                            if ($firstActiveStore && $firstActiveStore->store->tenant_id) {
                                $disabledStoreUser->update(['tenant_id' => $firstActiveStore->store->tenant_id]);
                            }
                        }
                    }
                }
            }

            $activeStores = $userStores->where('status', 1);
            if ($activeStores->count() > $subscription->plan->no_of_stores) {
                $storeIdsToDisable = $activeStores->sortBy('id')->pluck('id')->slice($subscription->plan->no_of_stores)->values()->toArray();
                $disableStores = Store::whereIn('id', $storeIdsToDisable)->get();
                foreach ($disableStores as $store) {
                    if ($storeUser->tenant_id = $store->tenant_id) {
                        $storeUser->update(['tenant_id' => $activeStores->first()->tenant_id]);
                    }
                    $store->status = 0;
                    $store->save();
                }
            }

            $subscription->update([
                'status' => (int) $validated['status'],
                'is_paid' => (int) $validated['status'] == Subscription::ACTIVE ? 1 : 0,
            ]);

            if ($subscription->status == Subscription::ACTIVE) {
                Subscription::where('user_id', $subscription->user_id)
                    ->whereNot('id', $subscription->id)
                    ->where('status', Subscription::ACTIVE)
                    ->update(['status' => Subscription::INACTIVE]);
            }

            return $this->sendSuccess(__('messages.success.status_updated'));
        }

        return $this->sendError('Status can\'t be updated');
    }

    public function endDateUpdate(Request $request, Subscription $subscription)
    {
        $validated = $request->validate([
            'end_date' => [
                'required',
                'date',
                'after:' . Carbon::now()->toDateTimeString(),
            ],
        ]);

        $subscription->update([
            'end_date' => $validated['end_date'],
        ]);

        return $this->sendSuccess('Subscription end date updated successfully');
    }

    public function getTransactions(Request $request): TransactionCollection
    {
        $perPage = getPageSize($request);
        $filter = $request->get('filter') ?? null;
        $transactions = App::make(TransactionRepository::class)->getTransactions($perPage, $filter);
        TransactionResource::usingWithCollection();

        return new TransactionCollection($transactions);
    }
}
