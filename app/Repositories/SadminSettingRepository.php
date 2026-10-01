<?php

namespace App\Repositories;

use App\DotenvEditor;
use App\Models\SadminSetting;
use App\Models\Service;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SadminSettingRepository
 */
class SadminSettingRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'key',
        'value',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'key',
        'value',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model(): string
    {
        return SadminSetting::class;
    }

    /**
     * @return mixed
     */
    public function updateSettings($input)
    {
        try {
            DB::beginTransaction();
            if (isset($input['app_logo']) && !empty($input['app_logo'])) {
                /** @var SadminSetting $setting */
                $setting = SadminSetting::where('key', 'app_logo')->first();
                if ($setting === null) {
                    $setting = SadminSetting::create(['key' => 'app_logo']);
                }
                $setting->clearMediaCollection(SadminSetting::LOGO);
                $media = $setting->addMedia($input['app_logo'])->toMediaCollection(SadminSetting::LOGO, config('app.media_disc'));
                $setting = $setting->refresh();
                $setting->update(['value' => $media->getFullUrl()]);
            }
            if (isset($input['app_favicon']) && !empty($input['app_favicon'])) {
                /** @var SadminSetting $setting */
                $setting = SadminSetting::where('key', 'app_favicon')->first();
                if ($setting === null) {
                    $setting = SadminSetting::create(['key' => 'app_favicon']);
                }
                $setting->clearMediaCollection(SadminSetting::FAVICON);
                $media = $setting->addMedia($input['app_favicon'])->toMediaCollection(SadminSetting::FAVICON, config('app.media_disc'));
                $setting = $setting->refresh();
                $setting->update(['value' => $media->getFullUrl()]);
            }

            $settingInputArray = Arr::only($input, [
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
                'enable_nepali_datepicker',
            ]);

            foreach ($settingInputArray as $key => $value) {
                SadminSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
                // $setting = SadminSetting::where('key', $key)->first();
                // if ($setting === null) {
                //     SadminSetting::create(['key' => $key, 'value' => $value]);
                // } else {
                //     if ($key == 'show_version_on_footer' || $key == 'show_app_name_in_sidebar') {
                //         if (empty($value)) {
                //             $setting->update(['value' => false]);
                //         }
                //     }
                //     if ($setting) {
                //         $setting->update(['value' => $value]);
                //     } else {
                //         SadminSetting::create(['key' => $key, 'value' => $value]);
                //     }
                // }
            }
            DB::commit();

            return $input;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function getEnvData()
    {
        $env = new DotenvEditor();
        $key = $env->getContent();
        $data = collect($key)->only([
            'MAIL_MAILER',
            'MAIL_HOST',
            'MAIL_PORT',
            'MAIL_USERNAME',
            'MAIL_PASSWORD',
            'MAIL_FROM_ADDRESS',
            'MAIL_ENCRYPTION',
            'USE_DYNAMIC_SMTP',
        ])->toArray();

        return [
            'mail_mailer' => $data['MAIL_MAILER'],
            'mail_host' => $data['MAIL_HOST'],
            'mail_port' => $data['MAIL_PORT'],
            'mail_username' => $data['MAIL_USERNAME'],
            'mail_password' => $data['MAIL_PASSWORD'],
            'mail_from_address' => $data['MAIL_FROM_ADDRESS'],
            'mail_encryption' => $data['MAIL_ENCRYPTION'],
            'use_dynamic_smtp' => $data['USE_DYNAMIC_SMTP'] ?? false,
        ];
    }

    public function sendTestEmail($input)
    {
        try {
            Mail::to($input['email'])->send(new \App\Mail\TestEmail());
        } catch (Exception $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function updateMailEnvSetting($input)
    {
        $env = new DotenvEditor();
        $inputArr = Arr::except($input, ['_token']);
        $env->setAutoBackup(true);

        $envData = [
            'MAIL_MAILER' => (empty($inputArr['mail_mailer'])) ? '' : $inputArr['mail_mailer'],
            'MAIL_HOST' => (empty($inputArr['mail_host'])) ? '' : $inputArr['mail_host'],
            'MAIL_PORT' => (empty($inputArr['mail_port'])) ? '' : $inputArr['mail_port'],
            'MAIL_USERNAME' => (empty($inputArr['mail_username'])) ? '' : $inputArr['mail_username'],
            'MAIL_PASSWORD' => (empty($inputArr['mail_password'])) ? '' : $inputArr['mail_password'],
            'MAIL_FROM_ADDRESS' => (empty($inputArr['mail_from_address'])) ? '' : $inputArr['mail_from_address'],
            'MAIL_ENCRYPTION' => (empty($inputArr['mail_encryption'])) ? '' : $inputArr['mail_encryption'],
            'USE_DYNAMIC_SMTP' => (empty($inputArr['use_dynamic_smtp'])) ? '' : $inputArr['use_dynamic_smtp'],
        ];

        foreach ($envData as $key => $value) {
            SadminSetting::updateOrCreate(['key' => 'APP_' . $key], ['value' => $value]);
        }

        foreach ($envData as $key => $value) {
            $this->createOrUpdateEnv($env, $key, $value);
        }
    }

    public function updatePaymentSettings($input)
    {
        try {
            DB::beginTransaction();

            $settingInputArray = Arr::only($input, [
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
                'paystack_enabled',
                'paystack_key',
                'paystack_secret',
                'paystack_mode',
                'razorpay_enabled',
                'razorpay_key',
                'razorpay_secret',
                'razorpay_mode',
            ]);

            foreach ($settingInputArray as $key => $value) {
                SadminSetting::updateOrCreate(['key' => $key], ['value' => $value]);
            }

            // Update .env for keys
            $env = new DotenvEditor();

            $envKeysToUpdate = [
                'stripe_key' => 'STRIPE_KEY',
                'stripe_secret' => 'STRIPE_SECRET_KEY',
                'paypal_client_id' => 'PAYPAL_CLIENT_ID',
                'paypal_secret' => 'PAYPAL_SECRET',
                'paypal_mode' => 'PAYPAL_MODE',
                'razorpay_key' => 'RAZOR_KEY',
                'razorpay_secret' => 'RAZOR_SECRET',
            ];

            foreach ($envKeysToUpdate as $inputKey => $envKey) {
                if (isset($settingInputArray[$inputKey])) {
                    $this->createOrUpdateEnv($env, $envKey, $settingInputArray[$inputKey]);
                }
            }

            DB::commit();

            return true;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }

    public function createOrUpdateEnv($env, $key, $value): bool
    {
        if (!$env->keyExists($key)) {
            $env->addData([
                $key => $value,
            ]);

            return true;
        }
        $env->changeEnv([
            $key => $value,
        ]);

        return true;
    }
}
