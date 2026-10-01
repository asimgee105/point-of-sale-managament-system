<?php

use App\Http\Controllers\API\UserAPIController;
use App\Http\Controllers\BusinessInformationAPIController;
use App\Http\Controllers\Sadmin\CurrencyAPIController;
use App\Http\Controllers\Sadmin\LanguageAPIController;
use App\Http\Controllers\Sadmin\AdminAPIController;
use App\Http\Controllers\Sadmin\DashboardAPIController;
use App\Http\Controllers\Sadmin\FaqAPIController;
use App\Http\Controllers\Sadmin\FeatureAPIController;
use App\Http\Controllers\Sadmin\FrontCMSAPIController;
use App\Http\Controllers\Sadmin\PartnerAPIController;
use App\Http\Controllers\Sadmin\PlanAPIController;
use App\Http\Controllers\Sadmin\SadminSettingAPIController;
use App\Http\Controllers\Sadmin\StepAPIController;
use App\Http\Controllers\Sadmin\SubscriptionAPIController;
use App\Http\Controllers\Sadmin\TestimonialAPIController;
use App\Http\Controllers\Sadmin\WhyChooseUsAPIController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('languages/translation/{language}', [LanguageAPIController::class, 'showTranslation']);
    Route::post('languages/translation/{language}/update', [LanguageAPIController::class, 'updateTranslation']);
});

Route::middleware(['auth:sanctum', 'role:superadmin', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardAPIController::class, 'dashboard']);

    Route::resource('admin-users', AdminAPIController::class);
    Route::delete('/admin-users', [AdminAPIController::class, 'destroy']);
    Route::get('admin-users/email-verify/{admin_user}', [AdminAPIController::class, 'emailVerify']);
    Route::get('admin-users/status/{admin_user}', [AdminAPIController::class, 'statusUpdate']);
    Route::post('admin-users/change-password', [UserAPIController::class, 'changeUserPassword']);
    Route::resource('plans', PlanAPIController::class);
    Route::delete('plans', [PlanAPIController::class, 'destroy']);
    Route::get('plan-features', [PlanAPIController::class, 'planFeatures']);
    Route::get('plans/default/{plan}', [PlanAPIController::class, 'changeDefaultPlan']);
    Route::post('change-user-plan', [PlanAPIController::class, 'changeUserPlan']);

    // currencies route
    Route::resource('currencies', CurrencyAPIController::class);
    Route::delete('currencies', [CurrencyAPIController::class, 'destroy']);

    // languages route
    Route::resource('languages', LanguageAPIController::class);
    Route::post('languages/{language}/toggle-status', [LanguageAPIController::class, 'toggleStatus']);
    Route::post('languages/{language}/toggle-default', [LanguageAPIController::class, 'toggleDefault']);


    Route::get('settings', [SadminSettingAPIController::class, 'index']);
    Route::post('settings', [SadminSettingAPIController::class, 'update']);
    Route::get('states/{id}', [SadminSettingAPIController::class, 'getStates']);

    //Payment Settings
    Route::get('payment-settings', [SadminSettingAPIController::class, 'getPaymentSettings']);
    Route::post('payment-settings', [SadminSettingAPIController::class, 'updatePaymentSettings']);
    Route::get('mail-settings', [SadminSettingAPIController::class, 'getMailSettings']);
    Route::post('mail-settings/update', [SadminSettingAPIController::class, 'updateMailSettings']);
    Route::post('send-test-email', [SadminSettingAPIController::class, 'sendTestEmail']);

    //clear cache route
    Route::get('cache-clear', [SadminSettingAPIController::class, 'clearCache']);
    
    // Database backup route
    Route::post('backup-database', [SadminSettingAPIController::class, 'backupDatabase']);

    //Subscription
    Route::get('transactions', [SubscriptionAPIController::class, 'getTransactions']);
    Route::get('cash-payments', [SubscriptionAPIController::class, 'getCashPaymentRequests']);
    Route::get('subscriptions', [SubscriptionAPIController::class, 'getActiveSubscriptions']);
    Route::get('subscriptions/{subscription}', [SubscriptionAPIController::class, 'show'])->name('subscriptions.show');
    Route::post('subscriptions/{subscription}/status', [SubscriptionAPIController::class, 'updateStatus']);
    Route::post('subscriptions/{subscription}/update', [SubscriptionAPIController::class, 'endDateUpdate']);

    // Front CMS
    Route::get('hero-section', [FrontCMSAPIController::class, 'getHeroSection']);
    Route::post('hero-section', [FrontCMSAPIController::class, 'updateHeroSection']);

    Route::get('pages', [FrontCMSAPIController::class, 'getPages']);
    Route::post('pages', [FrontCMSAPIController::class, 'updatePages']);

    Route::get('services', [FrontCMSAPIController::class, 'getServices']);
    Route::get('services/{service}', [FrontCMSAPIController::class, 'getService']);
    Route::post('services/{service}', [FrontCMSAPIController::class, 'updateServices']);

    Route::get('contact-us', [FrontCMSAPIController::class, 'contactUs']);
    Route::delete('contact-us', [FrontCMSAPIController::class, 'deleteContactUs']);

    Route::resource('partners', PartnerAPIController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('business-information', BusinessInformationAPIController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('why-choose-us', WhyChooseUsAPIController::class)->only(['index', 'update']);
    Route::resource('testimonials', TestimonialAPIController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::resource('steps', StepAPIController::class)->only(['index', 'update']);
    Route::resource('features', FeatureAPIController::class)->only(['index', 'update']);
    Route::resource('faqs', FaqAPIController::class)->only(['index', 'store', 'show', 'update']);
    Route::delete('faqs', [FaqAPIController::class, 'destroy']);
});
