<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\PlanCollection;
use App\Http\Resources\PlanResource;
use App\Http\Resources\SubscriptionCollection;
use App\Http\Resources\SubscriptionResource;
use App\Models\Plan;
use App\Models\SadminSetting;
use App\Models\Subscription;
use App\Repositories\SubscriptionRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

    public function index(Request $request): SubscriptionCollection
    {
        $perPage = getPageSize($request);
        $filter = $request->get('filter') ?? null;
        $subscriptions = $this->subscriptionRepository->getUserSubscriptions($perPage, $filter);
        SubscriptionResource::usingWithCollection();

        return new SubscriptionCollection($subscriptions);
    }

    public function getPlans(Request $request)
    {
        $perPage = getPageSize($request);
        $plans = Plan::whereNot('assign_while_register', 1)->paginate($perPage);
        PlanResource::usingWithCollection();

        return new PlanCollection($plans);
    }

    public function getCurrentPlan()
    {
        $currentSubscription = Subscription::where('user_id', Auth::id())->where('status', Subscription::ACTIVE)->first();
        if (!empty($currentSubscription)) {
            $currentSubscription['currency_symbol'] = $currentSubscription->plan->currency->symbol;
            $currentSubscription['used_days'] = round(abs(Carbon::now()->diffInDays($currentSubscription->start_date)));

            $currentSubscription['total_days'] = Carbon::parse($currentSubscription->start_date)->diffInDays(Carbon::parse($currentSubscription->end_date));

            $currentSubscription['remaining_days'] = round($currentSubscription['total_days'] - $currentSubscription['used_days']);
            $perDayPrice = round($currentSubscription->plan_amount / $currentSubscription['total_days'], 2);
            $currentSubscription['remaining_balance'] = round($currentSubscription->plan_amount - ($perDayPrice * $currentSubscription['used_days']));
            $currentSubscription['used_balance'] = round($currentSubscription->plan_amount - $currentSubscription['remaining_balance']);

            return $this->sendResponse($currentSubscription->toArray(), 'Current Plan retrieved successfully');
        }

        return $this->sendError('Current Plan not found');
    }

    public function getComparePlans(Plan $plan)
    {
        $plan['currency_symbol'] = $plan->currency->symbol ?? '';
        $plan['start_date'] = Carbon::now()->format('jS F, Y');
        $end_date = Carbon::now()->addDays(7);
        if ($plan->trial_days > 0) {
            $end_date = Carbon::now()->addDays($plan->trial_days);
        } else {
            if ($plan->frequency == Plan::WEEKLY) {
                $end_date = Carbon::now()->addDays(7)->endOfDay();
            } elseif ($plan->frequency == Plan::MONTHLY) {
                $end_date = Carbon::now()->addMonths(1)->endOfDay();
            } elseif ($plan->frequency == Plan::YEARLY) {
                $end_date = Carbon::now()->addYears(1)->endOfDay();
            } elseif ($plan->frequency == Plan::UNLIMITED) {
                $end_date = Carbon::now()->addYears(1)->endOfDay();
            }
        }
        $plan['end_date'] = $end_date->format('jS F, Y');
        $plan['total_days'] = Carbon::parse($plan['start_date'])->diffInDays(Carbon::parse($plan['end_date']));

        $currentSubscription = Subscription::where('user_id', Auth::id())->where('status', Subscription::ACTIVE)->first();
        if (!empty($currentSubscription)) {
            $totalDays = (int) Carbon::parse($currentSubscription->start_date)->diffInDays($currentSubscription->end_date);
            $usedDays = (int) round(Carbon::parse($currentSubscription->start_date)->diffInDays(Carbon::now()));
            $remainingDays = $totalDays > $usedDays ? $totalDays - $usedDays : 0;
            if ($totalDays == 0) {
                $totalDays = 1;
            }
            $perDayPrice = (int) round($currentSubscription->plan_amount / $totalDays, 2);
            if ($currentSubscription->isExpired()) {
                $remainingBalance = 0.00;
                $usedBalance = 0.00;
            } else {
                $remainingBalance = (int) round($currentSubscription->plan_amount - ($perDayPrice * $usedDays));
                $usedBalance = (int) round($currentSubscription->plan_amount - $remainingBalance);
            }

            $currentSubscription['total_days'] = $totalDays;
            $currentSubscription['used_days'] = $usedDays;
            $currentSubscription['remaining_days'] = $remainingDays;
            $currentSubscription['currency_symbol'] = $currentSubscription->plan->currency->symbol;
            $currentSubscription['start_date'] = Carbon::parse($currentSubscription->start_date)->format('jS F, Y');
            $currentSubscription['end_date'] = Carbon::parse($currentSubscription->end_date)->format('jS F, Y');
            $currentSubscription['total_days'] = $totalDays;
            $currentSubscription['remaining_balance'] = $remainingBalance;
            $currentSubscription['used_balance'] = $usedBalance;
            $payableAmount = $remainingBalance > 0 ? $plan['price'] - $remainingBalance : $plan['price'];
        } else {
            $payableAmount = $plan['price'];
        }
        $plan['payable_amount'] = $payableAmount > 0 ? (int) $payableAmount : 0;

        $data = [
            'current_plan' => $currentSubscription,
            'new_plan' => $plan,
        ];
        return $this->sendResponse($data, 'Current Plan retrieved successfully');
    }

    public function getPaymentMethods()
    {
        $keyName = [
            'manual_payment_enabled',
            'stripe_enabled',
            'paypal_enabled',
            'razorpay_enabled',
            'paystack_enabled',
        ];

        $paymentTypeKeys = [
            'manual_payment_enabled' => Subscription::TYPE_MANUAL,
            'stripe_enabled' => Subscription::TYPE_STRIPE,
            'paypal_enabled' => Subscription::TYPE_PAYPAL,
            'razorpay_enabled' => Subscription::TYPE_RAZORPAY,
            'paystack_enabled' => Subscription::TYPE_PAYSTACK,
        ];

        $settings = SadminSetting::whereIn('key', $keyName)
            ->where('value', 1)
            ->pluck('key')
            ->map(function ($key) use ($paymentTypeKeys) {
                return $paymentTypeKeys[$key] ?? null;
            })
            ->filter()
            ->map(function ($type) {
                return [
                    'type' => $type,
                    'name' => Subscription::PAYMENT_TYPES[$type]
                ];
            })
            ->values();
        $data['payment_methods'] = $settings;
        $data['manual_payment_guide'] = getSadminSettingValue('manual_payment_guide') ?? null;

        return $this->sendResponse($data, 'Payment Methods retrieved successfully');
    }

    public function createSubscription(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'payment_type' => 'required',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ((int) $validated['payment_type'] == Subscription::TYPE_MANUAL) {
            $input = $request->all();
            $this->subscriptionRepository->createSubscription($input);
            return $this->sendSuccess(__('messages.success.subscription_created'));
        }

        return $this->sendError('Selected payment type is not available');
    }
}
