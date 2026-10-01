<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\SadminSetting;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Repositories\SubscriptionRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Razorpay\Api\Api;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class RazorpayPaymentController extends AppBaseController
{

    /** @var SubscriptionRepository */
    private $subscriptionRepository;

    public function __construct(SubscriptionRepository $subscriptionRepository)
    {
        $this->subscriptionRepository = $subscriptionRepository;
    }


    public function generateSession(Request $request)
    {
        $input = $request->validate([
            'plan_id' => 'required',
            'amount' => 'required',
        ]);

        $plan = Plan::findorfail($input['plan_id']);
        $amount = $input['amount'] * 100;

        $sadminSetting = SadminSetting::whereIn('key', ['razorpay_key', 'razorpay_secret'])->pluck('value', 'key')->toArray();
        $razorpaySecret = !empty($sadminSetting['razorpay_key']) ? $sadminSetting['razorpay_secret'] : config('services.razorpay.secret');
        $razorpayKey = !empty($sadminSetting['razorpay_key']) ? $sadminSetting['razorpay_key'] : config('services.razorpay.key');

        if (empty($razorpaySecret)) {
            return $this->sendError('Razorpay Secret is not set');
        }

        $api = new Api($razorpayKey, $razorpaySecret);

        $orderData = [
            'receipt' => (string) $plan->id,
            'amount' => intval($amount),
            'currency' => strtoupper($plan->currency->code),
            'notes' => [
                'plan_id' => $input['plan_id'],
                'stores' => json_encode($request->stores ?? []),
                'amount' => $amount,
                'user_id' => Auth::id(),
                'email' => Auth::user()->email,
            ],
        ];
        $razorpayOrder = $api->order->create($orderData);
        $data['razorpayOrder'] = $razorpayOrder->id;
        $data['amount'] = $amount;
        $data['name'] = Auth::user()->full_name;
        $data['email'] = Auth::user()->email;
        $data['contact'] = Auth::user()->phone;
        $data['plan_id'] = $plan->id;

        return $this->sendResponse($data, 'Razorpay session generated successfully.');
    }

    public function paymentSuccess(Request $request)
    {
        $input = $request->all();
        try {
            DB::beginTransaction();
            $sadminSetting = SadminSetting::whereIn('key', ['razorpay_key', 'razorpay_secret'])->pluck('value', 'key')->toArray();
            $razorpaySecret = !empty($sadminSetting['razorpay_key']) ? $sadminSetting['razorpay_secret'] : config('services.razorpay.secret');
            $razorpayKey = !empty($sadminSetting['razorpay_key']) ? $sadminSetting['razorpay_key'] : config('services.razorpay.key');

            if (empty($razorpaySecret) || empty($razorpayKey)) {
                return $this->sendError('Razorpay Secret is not set');
            }

            $api = new Api($razorpayKey, $razorpaySecret);

            if (count($input) && ! empty($input['razorpay_payment_id'])) {
                $payment = $api->payment->fetch($input['razorpay_payment_id']);
                $generatedSignature = hash_hmac(
                    'sha256',
                    $payment['order_id'] . '|' . $input['razorpay_payment_id'],
                    $razorpaySecret
                );
                if ($generatedSignature != $input['razorpay_signature']) {
                    return redirect('/app/user/payment-failed?status=false');
                }


                $razorpayOrder = $api->order->fetch($input['razorpay_order_id']);

                $user = User::find($payment['notes']['user_id']);

                $transaction = Transaction::create([
                    'tenant_id' => $user->tenant_id,
                    'transaction_id' => $input['razorpay_payment_id'],
                    'amount' => $payment['amount'] / 100,
                    'type' => Subscription::TYPE_RAZORPAY,
                    'status' => Transaction::PAID,
                    'user_id' => $user->id,
                    'meta' => json_encode($razorpayOrder->toArray()),
                ]);

                $stores = $payment['notes']['stores'] ?? null;

                if (!empty($stores)) {
                    if (is_string($stores)) {
                        $decoded = json_decode($stores, true);
                        $stores = is_array($decoded) ? $decoded : null;
                    }
                    if (is_array($stores)) {
                        $stores = array_filter($stores, fn($item) => !empty($item));
                        $stores = empty($stores) ? null : array_values($stores);
                    }
                }

                $this->subscriptionRepository->createSubscription([
                    'plan_id' => $payment['notes']['plan_id'],
                    'user_id' => $payment['notes']['user_id'],
                    'stores' => $stores ?? null,
                    'payment_type' => Subscription::TYPE_RAZORPAY,
                    'transaction_id' => $transaction->id,
                ]);
            }
            DB::commit();

            return redirect('/app/user/payment-success?status=true');
        } catch (HttpException $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function paymentFailed(Request $request)
    {
        return redirect('/app/user/payment-failed?status=false');
    }
}
