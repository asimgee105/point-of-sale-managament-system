<?php

namespace App\Http\Controllers\Sadmin;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreatePlanRequest;
use App\Http\Requests\UpdatePlanRequest;
use App\Http\Resources\PlanCollection;
use App\Http\Resources\PlanResource;
use App\Models\Plan;
use App\Models\PlanFeature;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Repositories\PlanRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Class PlanAPIController
 */
class PlanAPIController extends AppBaseController
{
    /** @var PlanRepository */
    private $planRepository;

    public function __construct(PlanRepository $planRepository)
    {
        $this->planRepository = $planRepository;
    }

    public function index(Request $request): PlanCollection
    {
        $perPage = getPageSize($request);
        $plans = $this->planRepository->getPlans($perPage);
        PlanResource::usingWithCollection();

        return new PlanCollection($plans);
    }

    public function store(CreatePlanRequest $request): PlanResource
    {

        $input = $request->all();
        $plan = $this->planRepository->storePlan($input);

        return new PlanResource($plan);
    }

    public function show(Plan $plan): PlanResource
    {
        return new PlanResource($plan);
    }

    /**
     * @return PlanResource|JsonResponse
     */
    public function update(UpdatePlanRequest $request, Plan $plan)
    {

        $input = $request->all();
        $plan = $this->planRepository->updatePlan($input, $plan->id);

        return new PlanResource($plan);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (!is_array($ids)) {
            return $this->sendError('Invalid request format.');
        }

        $cannotDeletePlans = [];

        try {
            DB::beginTransaction();

            foreach ($ids as $id) {
                $plan = $this->planRepository->find($id);

                if (!$plan) {
                    continue;
                }

                if ($plan->is_default) {
                    $cannotDeletePlans[] = [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'reason' => __('messages.error.default_plan_delete'),
                    ];
                    continue;
                }

                $subscription = Subscription::whereIn('status', [Subscription::ACTIVE, Subscription::PENDING])
                    ->where('plan_id', $plan->id)
                    ->first();

                if ($subscription) {
                    $cannotDeletePlans[] = [
                        'id' => $plan->id,
                        'name' => $plan->name,
                    ];
                    continue;
                }

                $this->planRepository->delete($plan->id);
            }

            DB::commit();

            if (count($cannotDeletePlans) > 0) {
                return $this->sendResponse([
                    'show_model' => true,
                    'ids' => $cannotDeletePlans,
                ], 'Some plans could not be deleted');
            }

            return $this->sendResponse([
                'show_model' => count($cannotDeletePlans) > 0,
                'ids' => $cannotDeletePlans
            ], 'Currencies deleted successfully');

            $message = count($ids) === 1 ? 'Plan deleted successfully' : 'Plans deleted successfully';
            return $this->sendSuccess($message);
        } catch (\Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    public function changeDefaultPlan(Plan $plan): JsonResponse
    {

        Plan::where('assign_while_register', true)->update(['assign_while_register' => false]);
        $plan->update(['assign_while_register' => true]);
        return $this->sendSuccess(__('messages.success.default_plan_updated'));
    }

    public function planFeatures(): JsonResponse
    {
        $features = [
            'pos_management',
            'reports',
            'emails_support',
            'sms_support',
            'inventory_management',
            'adjustments',
            'roles_permission',
        ];
        return $this->sendResponse($features, 'Plan features retrieved successfully');
    }

    public function changeUserPlan(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::withoutGlobalScope('tenant')->find($validated['user_id']);
        $plan = Plan::find($validated['plan_id']);
        $data = [];
        $currentSubscription = Subscription::where('user_id', $user->id)->where('status', Subscription::ACTIVE)->first();
        if (!empty($currentSubscription)) {
            $data['current_plan_stores'] = $currentSubscription->plan->no_of_stores ?? 0;
        }
        $data['new_plan_stores'] = $plan->no_of_stores ?? 0;
        $userStores = Store::where('user_id', $user->id)->get();
        $data['user_stores_count'] = $userStores->count();
        $data['user_active_stores'] = $userStores->where('status', 1)->count();
        $data['user_stores'] = $userStores->where('status', 1)->map(function ($store) use ($user) {
            return [
                'id' => $store->id,
                'active' => $store->tenant_id == $user->tenant_id,
                'name' => $store->name,
            ];
        })->toArray();

        return $this->sendResponse($data, 'Success');
    }
}
