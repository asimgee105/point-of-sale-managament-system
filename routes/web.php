<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TwoFactorAuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PaypalPaymentController;
use App\Http\Controllers\PaystackPaymentController;
use App\Http\Controllers\RazorpayPaymentController;
use App\Http\Controllers\StripePaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return view('web.app');
// });

Route::any('/app', function () {
    return view('web.app');
})->name('app');

// Catch-all route for React SPA - handles all /app/* routes
Route::any('/app/{any}', function () {
    return view('web.app');
})->where('any', '.*');

Route::get('/email/verify/{id}', [AuthController::class, 'emailVerification'])
    ->middleware(['signed'])
    ->name('verification.verify');

Route::get('/email-verify', [AuthController::class, 'viewEmailVerification'])->name('email-verify');

Route::middleware(['set_language'])->group(function () {
    Route::any('/', [HomeController::class, 'index'])->name('home');
    Route::get('/faqs', [HomeController::class, 'faqs'])->name('faqs');
    Route::get('/terms-and-conditions', [HomeController::class, 'termsAndConditions'])->name('terms-and-conditions');
    Route::get('/privacy-policy', [HomeController::class, 'privacyPolicy'])->name('privacy-policy');
    Route::get('/return-policy', [HomeController::class, 'returnPolicy'])->name('return-policy');
    Route::post('/', [HomeController::class, 'contactUs'])->name('contact-us');
});
Route::post('change-language', [HomeController::class, 'changeLanguage'])->name('change-language');

Route::any('/stripe/payment-success', [StripePaymentController::class, 'paymentSuccess'])->name('stripe-success');
Route::any('/stripe/failed/', [StripePaymentController::class, 'paymentFailed'])->name('stripe-failed');

Route::any('/paypal/paypal-success', [PaypalPaymentController::class, 'paymentSuccess'])->name('paypal-success');
Route::any('/paypal/failed/', [PaypalPaymentController::class, 'paymentFailed'])->name('paypal-failed');

Route::any('/razorpay/success', [RazorpayPaymentController::class, 'paymentSuccess'])->name('razorpay-success');
Route::any('/razorpay/failed/', [RazorpayPaymentController::class, 'paymentFailed'])->name('razorpay-failed');

Route::any('/paystack/payment-success', [PaystackPaymentController::class, 'paymentSuccess'])->name('paystack-success');
Route::get('two-factor-auth/download-recovery-codes/{user}', [TwoFactorAuthController::class, 'downloadRecoveryCodes'])->middleware(['signed', 'throttle:10,1'])->name('two-factor.download-recovery-codes');

include 'upgrade.php';
