<?php

namespace App\Http\Controllers\Sadmin;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\SettingResource;
use App\Models\SadminSetting;
use App\Models\State;
use App\Repositories\SadminSettingRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Class SadminSettingAPIController
 */
class SadminSettingAPIController extends AppBaseController
{
    /** @var SadminSettingRepository */
    private $sadminSettingRepository;

    public function __construct(SadminSettingRepository $sadminSettingRepository)
    {
        $this->sadminSettingRepository = $sadminSettingRepository;
    }

    public function index(): JsonResponse
    {
        $keyName = [
            'app_name',
            'app_email',
            'company_name',
            'phone',
            'footer',
            'country',
            'state',
            'city',
            'postcode',
            'address',
            'show_version_on_footer',
            'show_app_name_in_sidebar',
            'admin_default_currency_symbol',
            'admin_default_currency',
            'send_registration_mail',
            'show_landing_page',
            'default_country_code',
            'plan_expire_notification_day',
            'captcha_enabled',
            'captcha_key',
            'captcha_secret',
            'decimal_places',
            'thousands_separator',
            'decimal_separator',
            'is_currency_right',
            'enable_nepali_datepicker'
        ];
        $settings = SadminSetting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        $settings['app_logo'] = getAppLogoUrl();
        $settings['app_favicon'] = getAppFaviconUrl();
        $settings['send_registration_mail'] = isset($settings['send_registration_mail']) ? $settings['send_registration_mail'] : "true";
        $settings['show_landing_page'] = isset($settings['show_landing_page']) ? $settings['show_landing_page'] : 1;
        $settings['decimal_places'] = $settings['decimal_places'] ?? "2";
        $settings['thousands_separator'] = $settings['thousands_separator'] ?? "2";
        $settings['decimal_separator'] = $settings['decimal_separator'] ?? "1";
        $settings['is_currency_right'] = $settings['is_currency_right'] ?? "false";
        $settings['enable_nepali_datepicker'] = $settings['enable_nepali_datepicker'] ?? "0";

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'attributes' => $settings]),
            'Setting value retrieved successfully.'
        );
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'app_logo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
            'app_favicon' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        $input = $request->all();
        $settings = $this->sadminSettingRepository->updateSettings($input);

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'attributes' => $settings]),
            __('messages.success.setting_updated')
        );
    }

    public function clearCache(): JsonResponse
    {
        Artisan::call('cache:clear');

        return $this->sendSuccess(__('messages.success.cache_clear_successfully'));
    }

    public function backupDatabase(): JsonResponse|BinaryFileResponse
    {
        try {
            // Get database configuration
            $dbHost = config('database.connections.mysql.host');
            $dbPort = config('database.connections.mysql.port');
            $dbName = config('database.connections.mysql.database');
            $dbUser = config('database.connections.mysql.username');
            $dbPass = config('database.connections.mysql.password');

            // Create backup filename with timestamp
            $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
            $filepath = storage_path('app/backups/' . $filename);

            // Ensure backup directory exists
            if (!file_exists(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }

            // Execute mysqldump command
            $command = "mysqldump --host={$dbHost} --port={$dbPort} --user={$dbUser} --password={$dbPass} {$dbName} > {$filepath}";

            $result = null;
            $output = [];
            exec($command . ' 2>&1', $output, $result);

            if ($result !== 0) {
                return $this->sendError('Database backup failed: ' . implode("\n", $output));
            }

            // Check if file was created
            if (!file_exists($filepath)) {
                return $this->sendError('Database backup file was not created');
            }

            // Return the file for download
            return response()->download($filepath, $filename);
        } catch (\Exception $e) {
            return $this->sendError('Database backup failed: ' . $e->getMessage());
        }
    }

    public function getStates($countryId): JsonResponse
    {
        $states = State::whereCountryId($countryId)->pluck('name');

        return $this->sendResponse(
            new SettingResource(['type' => 'states', 'attributes' => $states]),
            'States retrieved successfully.'
        );
    }

    public function getPaymentSettings(): JsonResponse
    {
        $keyName = [
            'manual_payment_enabled',
            'manual_payment_guide',
            'stripe_enabled',
            'stripe_key',
            'stripe_secret',
            'stripe_mode',
            'paypal_enabled',
            'paypal_client_id',
            'paypal_secret',
            'paypal_mode',
            'razorpay_enabled',
            'razorpay_key',
            'razorpay_secret',
            'razorpay_mode',
            'paystack_enabled',
            'paystack_key',
            'paystack_secret',
            'paystack_mode',
        ];

        $settings = SadminSetting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'attributes' => $settings]),
            'Payment Setting retrieved successfully.'
        );
    }

    public function updatePaymentSettings(Request $request): JsonResponse
    {
        $validated = $request->validate(
            [
                'manual_payment_enabled' => 'boolean',
                'manual_payment_guide' => 'required_if:manual_payment_enabled,1',
                'stripe_enabled' => 'boolean',
                'stripe_key' => 'required_if:stripe_enabled,1',
                'stripe_secret' => 'required_if:stripe_enabled,1',
                'stripe_mode' => 'required_if:stripe_enabled,1',
                'paypal_enabled' => 'boolean',
                'paypal_client_id' => 'required_if:paypal_enabled,1',
                'paypal_secret' => 'required_if:paypal_enabled,1',
                'paypal_mode' => 'required_if:paypal_enabled,1',
                'razorpay_enabled' => 'boolean',
                'razorpay_key' => 'required_if:razorpay_enabled,1',
                'razorpay_secret' => 'required_if:razorpay_enabled,1',
                'razorpay_mode' => 'required_if:razorpay_enabled,1',
                'paystack_enabled' => 'boolean',
                'paystack_key' => 'required_if:paystack_enabled,1',
                'paystack_secret' => 'required_if:paystack_enabled,1',
                'paystack_mode' => 'required_if:paystack_enabled,1',
            ]
        );

        $settings = $this->sadminSettingRepository->updatePaymentSettings($validated);

        return $this->sendResponse(
            new SettingResource(['type' => 'settings', 'attributes' => $settings]),
            __('messages.success.payment_settings_updated')
        );
    }

    public function getMailSettings()
    {
        $envData = $this->sadminSettingRepository->getEnvData();

        return $this->sendResponse($envData, 'Mail Credential Retrieved Successfully');
    }

    public function updateMailSettings(Request $request): JsonResponse
    {
        $request->validate([
            'mail_mailer' => 'required',
            'mail_host' => 'required',
            'mail_port' => 'required',
            'mail_username' => 'required',
            'mail_password' => 'required',
            'mail_from_address' => 'required',
            'mail_encryption' => 'required',
            'use_dynamic_smtp' => 'boolean'
        ]);
        $this->sadminSettingRepository->updateMailEnvSetting($request->all());

        Artisan::call('optimize:clear');
        Artisan::call('config:cache');

        return $this->sendSuccess('Mail Settings Save Successfully');
    }

    public function sendTestEmail()
    {
        // Get the logged-in user's email
        $userEmail = auth()->user()->email;

        // Send test email to the logged-in user
        $this->sadminSettingRepository->sendTestEmail(['email' => $userEmail]);

        return $this->sendSuccess("Test email sent successfully to {$userEmail}");
    }
}
