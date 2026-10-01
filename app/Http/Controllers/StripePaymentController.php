<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\SadminSetting;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Repositories\SubscriptionRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StripePaymentController extends AppBaseController
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

        $sadminSetting = SadminSetting::whereIn('key', ['stripe_key', 'stripe_secret'])->pluck('value', 'key')->toArray();
        $stripeSecret = !empty($sadminSetting['stripe_secret']) ? $sadminSetting['stripe_secret'] : config('services.stripe.secret');

        if (empty($stripeSecret)) {
            return $this->sendError('Stripe Secret is not set');
        }

        Stripe::setApiKey($stripeSecret);

        $metadata = json_encode([
            'user_id' => Auth::id(),
            'stores' => json_encode($request->stores ?? []),
            'plan_id' => $input['plan_id'],
            'amount' => $amount,
        ]);

        $session = Session::create([
            'payment_method_types' => ['card'],
            'customer_email' => Auth::user()->email,
            'line_items' => [[

                'price_data' => [
                    'currency' => strtoupper($plan->currency->code),
                    'unit_amount' => $amount,
                    'product_data' => [
                        'name' => $plan->name,
                        'description' => $plan->description,
                    ],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'billing_address_collection' => 'required',
            'client_reference_id' => $metadata,
            'success_url' => route('stripe-success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('stripe-failed', ['plan_id' => $plan->id, 'amount' => $amount]) . '&session_id={CHECKOUT_SESSION_ID}&error=payment_cancelled',
        ]);

        return $this->sendResponse(['url' => $session->url], 'Stripe session generated successfully.');
    }

    public function paymentSuccess(Request $request)
    {
        $sadminSetting = SadminSetting::whereIn('key', ['stripe_key', 'stripe_secret'])->pluck('value', 'key')->toArray();
        $stripeSecret = !empty($sadminSetting['stripe_secret']) ? $sadminSetting['stripe_secret'] : config('services.stripe.secret');
        Stripe::setApiKey($stripeSecret);

        if (empty($request['session_id'])) {
            throw new UnprocessableEntityHttpException('Session ID is required');
        }

        try {
            $sessionData = Session::retrieve($request['session_id']);
            $sessionID = $sessionData->id;
            $metaData = json_decode($sessionData['client_reference_id'], true);
            $user = User::findorfail($metaData['user_id']);

            $transaction = Transaction::create([
                'tenant_id' => $user->tenant_id,
                'transaction_id' => $sessionID,
                'amount' => $metaData['amount'] / 100,
                'type' => Subscription::TYPE_STRIPE,
                'status' => Transaction::PAID,
                'user_id' => $user->id,
                'meta' => json_encode($sessionData->toArray()),
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
                'payment_type' => Subscription::TYPE_STRIPE,
                'transaction_id' => $transaction->id,
            ]);

            // Payment success redirect url
            return redirect('/app/user/payment-success?status=true');
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function paymentFailed()
    {
        // Payment failed redirect url
        return redirect('/app/user/payment-failed?status=false');
    }
}
