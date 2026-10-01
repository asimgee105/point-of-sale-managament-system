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
use Srmklive\PayPal\Services\PayPal;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PaypalPaymentController extends AppBaseController
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

        $plan = Plan::findOrFail($input['plan_id']);
        $amount = $input['amount'];
        if (! in_array(strtoupper($plan->currency->code), getPayPalSupportedCurrencies())) {
            return $this->sendError(__('messages.error.currency_not_supported_paypal'));
        }
        $sadminSetting = SadminSetting::whereIn('key', ['paypal_client_id', 'paypal_secret', 'paypal_mode'])->pluck('value', 'key')->toArray();

        $clientId = !empty($sadminSetting['paypal_client_id']) ? $sadminSetting['paypal_client_id'] : config('payment.paypal.client_id');
        $clientSecret = !empty($sadminSetting['paypal_secret']) ? $sadminSetting['paypal_secret'] : config('payment.paypal.client_secret');
        $mode = !empty($sadminSetting['paypal_mode']) ? $sadminSetting['paypal_mode'] : config('payment.paypal.mode');

        config([
            'paypal.mode'                  => $mode,
            'paypal.sandbox.client_id'     => $clientId,
            'paypal.sandbox.client_secret' => $clientSecret,
            'paypal.live.client_id'        => $clientId,
            'paypal.live.client_secret'    => $clientSecret,
        ]);

        $provider = new PayPal();
        $provider->getAccessToken();

        $metadata = json_encode([
            'user_id' => Auth::user()->id,
            'stores' => json_encode($request->stores ?? []),
            'plan_id' => $input['plan_id'],
        ]);

        $data = [
            'intent'              => 'CAPTURE',
            'purchase_units'      => [
                [
                    'reference_id' => $metadata,
                    'amount'       => [
                        'value'         => $amount,
                        'currency_code' => 'usd',
                    ],
                ],
            ],
            'application_context' => [
                'cancel_url' =>  route('paypal-failed', ['plan_id' => $plan->id, 'amount' => $amount]) . '&error=payment_cancelled',
                'return_url' => route('paypal-success'),
            ],

        ];

        $order = $provider->createOrder($data);

        return $this->sendResponse(['url' => $order['links'][1]['href']], 'Paypal session generated successfully.');
    }

    public function paymentSuccess(Request $request)
    {
        $request['token'] = Str::after($request['token'], 'token=');

        $sadminSetting = SadminSetting::whereIn('key', ['paypal_client_id', 'paypal_secret'])->pluck('value', 'key')->toArray();

        $clientId = !empty($sadminSetting['paypal_client_id']) ? $sadminSetting['paypal_client_id'] : config('payment.paypal.client_id');
        $clientSecret = !empty($sadminSetting['paypal_secret']) ? $sadminSetting['paypal_secret'] : config('payment.paypal.client_secret');
        $mode = !empty(config('payment.paypal.mode')) ? config('payment.paypal.mode') : 'sandbox';

        config([
            'paypal.mode'                  => $mode,
            'paypal.sandbox.client_id'     => $clientId,
            'paypal.sandbox.client_secret' => $clientSecret,
            'paypal.live.client_id'        => $clientId,
            'paypal.live.client_secret'    => $clientSecret,
        ]);

        $provider = new PayPal();
        $provider->getAccessToken();
        $token = $request['token'];
        // $orderInfo = $provider->showOrderDetails($token);

        try {
            $response = $provider->capturePaymentOrder($token);
            $metaData = json_decode($response['purchase_units'][0]['reference_id'], true);
            $value =  json_decode($response['purchase_units'][0]['payments']['captures'][0]['amount']['value'], true);
            $user = User::findorfail($metaData['user_id']);

            $transaction = Transaction::create([
                'tenant_id' => $user->tenant_id,
                'transaction_id' => $response['id'],
                'amount' => $value,
                'type' => Subscription::TYPE_PAYPAL,
                'status' => Transaction::PAID,
                'user_id' => $user->id,
                'meta' => json_encode($response),
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
                'payment_type' => Subscription::TYPE_PAYPAL,
                'transaction_id' => $transaction->id,
            ]);

            // Payment success redirect url
            return redirect('/app/user/payment-success?status=true');
        } catch (HttpException $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function paymentFailed()
    {
        // Payment failed redirect url
        return redirect('/app/user/payment-failed?status=false');
    }
}
