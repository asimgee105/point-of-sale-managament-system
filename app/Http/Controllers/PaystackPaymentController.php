<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Plan;
use Illuminate\Http\Request;
use App\Models\SadminSetting;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Repositories\SubscriptionRepository;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Yabacon\Paystack;

class PaystackPaymentController extends AppBaseController
{
    /** @var SubscriptionRepository $subscriptionRepository */
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

        $sadminSetting = SadminSetting::whereIn('key', ['paystack_key', 'paystack_secret'])->pluck('value', 'key')->toArray();

        $paystackPublic = !empty($sadminSetting['paystack_key']) ? $sadminSetting['paystack_key'] : '';
        $paystackSecret = !empty($sadminSetting['paystack_secret']) ? $sadminSetting['paystack_secret'] : '';

        $user = Auth::user();

        try {

            $paystack = new Paystack($paystackSecret);

            $reference = 'paystack_' . bin2hex(random_bytes(6));

            $tranx = $paystack->transaction->initialize([
                'email' => $user->email,
                'amount' => $amount,
                'reference' => $reference,
                'callback_url' => route('paystack-success'),
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'amount' => $amount,
                    'referrer' => url()->previous(),
                    'stores' => $request->get('stores'),
                ],
            ]);


            return $this->sendResponse(['url' => $tranx->data->authorization_url], 'Paystack payment link generated successfully.');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    public function paymentSuccess(Request $request)
    {
        $reference = $request->query('reference');
        if (empty($reference)) {
            return redirect('/app/user/payment-failed?status=false');
        }

        $sadminSetting = SadminSetting::whereIn('key', ['paystack_key', 'paystack_secret'])->pluck('value', 'key')->toArray();
        $paystackSecret = $sadminSetting['paystack_secret'] ?? config('paystack.secretKey');
        try {
            DB::beginTransaction();

            $paystack = new Paystack($paystackSecret);

            $tranx = $paystack->transaction->verify([
                'reference' => $reference,
            ]);
            if (!$tranx->status || $tranx->data->status !== 'success') {
                return redirect('/app/user/payment-failed?status=false');
            }

            $metaData = (array) $tranx->data->metadata ?? [];

            $user = User::findorfail($metaData['user_id']);

            $transaction = Transaction::create([
                'tenant_id' => $user->tenant_id,
                'transaction_id' => $tranx->data->id,
                'amount' => $metaData['amount'] / 100,
                'type' => Subscription::TYPE_PAYSTACK,
                'status' => Transaction::PAID,
                'user_id' => $user->id,
                'meta' => json_encode($tranx->data),
            ]);

            $stores = $metaData['stores'] ?? null;

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
                'plan_id' => $metaData['plan_id'],
                'user_id' => $metaData['user_id'],
                'stores' => $stores ?? null,
                'payment_type' => Subscription::TYPE_PAYSTACK,
                'transaction_id' => $transaction->id,
            ]);

            DB::commit();

            // Payment success redirect url
            return redirect('/app/user/payment-success?status=true');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
