<?php

namespace App\Repositories;

use App\Models\BaseUnit;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Language;
use App\Models\MailTemplate;
use App\Models\MultiTenant;
use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Models\Role;
use App\Models\Setting;
use App\Models\SmsSetting;
use App\Models\SmsTemplate;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserStore;
use App\Models\Warehouse;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class AdminRepository
 */
class AdminRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'region',
        'created_at',
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
    public function model()
    {
        return User::class;
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function storeAdmin($input)
    {
        try {
            DB::beginTransaction();
            $input['password'] = Hash::make($input['password']);

            $defaultLanguage = Language::where('is_default', 1)->first();
            $input['language'] = $defaultLanguage->iso_code ?? 'en';
            $user = $this->create($input);

            $user->assignRole(Role::ADMIN);

            $store = Store::create([
                'name' => 'My Store',
                'user_id' => $user->id,
            ]);
            $tenant = MultiTenant::create(['store_id' => $store->id]);
            $store->update(['tenant_id' => $tenant->id]);
            $user->update(['tenant_id' => $tenant->id]);

            if (isset($input['plan_id'])) {
                $plan = Plan::find($input['plan_id']);
                SubscriptionRepository::createSubscription([
                    'plan_id' => $plan->id,
                    'user_id' => $user->id,
                    'payment_type' => Subscription::TYPE_MANUAL,
                    'status' => Subscription::ACTIVE,
                ]);
            } else {
                $plan = Plan::where('assign_while_register', true)->first();
                SubscriptionRepository::createSubscription([
                    'plan_id' => $plan->id,
                    'user_id' => $user->id,
                    'payment_type' => Subscription::TYPE_FREE,
                ]);
            }

            // Default Settings
            $this->defaultSettings($user->tenant_id);

            if (isset($input['image']) && ! empty($input['image'])) {
                $user->addMedia($input['image'])->toMediaCollection(
                    User::PATH,
                    config('app.media_disc')
                );
            }
            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function updateAdmin($input, $user)
    {
        try {
            DB::beginTransaction();
            $user->update($input);

            if (isset($input['image']) && $input['image']) {
                $user->clearMediaCollection(User::PATH);
                $user['image_url'] = $user->addMedia($input['image'])->toMediaCollection(
                    User::PATH,
                    config('app.media_disc')
                );
            }
            DB::commit();

            $plan = null;
            if (isset($input['plan_id'])) {
                $plan = Plan::find($input['plan_id']);
            }
            if ($plan != null) {
                $storeIds = array_map('intval', array_filter(explode(',', $input['stores'] ?? '')));

                $currentPlan = Subscription::with('plan')
                    ->where('user_id', $user->id)
                    ->where('status', Subscription::ACTIVE)->latest()->first();
                if ($currentPlan) {
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

                    $currentPlan->update([
                        'plan_id' => $plan->id,
                        'plan_amount' => $plan->price,
                        'plan_frequency' => $plan->frequency,
                        'start_date' => Carbon::now(),
                        'end_date' => $end_date,
                        'trial_ends_at' => $plan->trial_days > 0 ? $end_date : null,
                        'payment_type' => Subscription::TYPE_MANUAL,
                        'status' => Subscription::ACTIVE,
                    ]);
                    Subscription::where('user_id', $currentPlan->user_id)
                        ->whereNot('id', $currentPlan->id)
                        ->where('status', Subscription::ACTIVE)
                        ->update(['status' => Subscription::INACTIVE]);

                    if (count($storeIds) > 0) {
                        $userAllStores = Store::where('user_id', $user->id)->get();
                        foreach ($userAllStores as $store) {
                            if (!in_array($store->id, $storeIds)) {
                                $store->update(['status' => 0]);
                            }
                        }
                        $disabledStores = Store::where('user_id', $user->id)->where('status', 0)->get();
                        foreach ($disabledStores as $store) {
                            UserStore::where('store_id', $store->id)->delete();
                            $disabledStoresUsers = User::where('tenant_id', $store->tenant_id)->get();
                            foreach ($disabledStoresUsers as $disabledStoreUser) {
                                $firstActiveStore = UserStore::where('user_id', $disabledStoreUser->id)->first();
                                if ($firstActiveStore && $firstActiveStore->store->tenant_id) {
                                    $disabledStoreUser->update(['tenant_id' => $firstActiveStore->store->tenant_id]);
                                }
                            }
                        }
                    }
                } else {
                    SubscriptionRepository::createSubscription([
                        'plan_id' => $plan->id,
                        'user_id' => $user->id,
                        'payment_type' => Subscription::TYPE_MANUAL,
                        'status' => Subscription::ACTIVE,
                    ]);
                }
            }

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function getUsers($perPage)
    {
        return $this->withoutGlobalScope('tenant')->where('tenant_id', '!=', null)
            ->whereHas('roles', function ($q) {
                $q->where('name', Role::ADMIN);
            })->paginate($perPage);
    }

    public function defaultSettings($tenantId)
    {
        // Base Units
        $baseUnits = ['piece', 'meter', 'kilogram'];
        foreach ($baseUnits as $baseUnit) {
            BaseUnit::create([
                'tenant_id' => $tenantId,
                'name' => $baseUnit,
                'is_default' => 1,
            ]);
        }

        // Mail Templates
        $mailTemplates = [
            [
                'tenant_id' => $tenantId,
                'template_name' => 'GREETING TO CUSTOMER ON SALES !',
                'content' => '<p>Hi, {customer_name}</p><p>Your sales Id is {sales_id}</p><p>Sales Date: {sales_date}</p><p>Total Amount: {sales_amount}</p><p>You have paid: {paid_amount}</p><p>Due amount: {due_amount}</p><p>Regards,  {app_name}</p>',
                'type' => MailTemplate::MAIL_TYPE_SALE
            ],
            [
                'tenant_id' => $tenantId,
                'template_name' => 'GREETING TO CUSTOMER ON SALES RETURN !',
                'content' => '<p>Hi, {customer_name}</p><p>Your sales return Id is {sales_return_id}</p><p>Sales return Date: {sales_return_date}</p><p>Total Amount: {sales_return_amount}</p><p>Regards,  {app_name}</p>',
                'type' => MailTemplate::MAIL_TYPE_SALE_RETURN,
            ]
        ];
        foreach ($mailTemplates as $mailTemplate) {
            MailTemplate::create($mailTemplate);
        }

        // SMS Settings
        $smsSettings = [
            'url' => 'http://test.com/api/test.php',
            'mobile_key' => '',
            'message_key' => '',
            'payload' => '',
        ];
        foreach ($smsSettings as $key => $value) {
            SmsSetting::create([
                'tenant_id' => $tenantId,
                'key' => $key,
                'value' => $value
            ]);
        }

        // SMS Templates
        $smsTemplates = [
            [
                'tenant_id' => $tenantId,
                'template_name' => 'GREETING TO CUSTOMER ON SALES !',
                'content' => 'Hi {customer_name}, Your sales Id is {sales_id}, Sales Date {sales_date}, Total Amount {sales_amount}, You have paid {paid_amount}, and customer total due amount is {due_amount} Thank you visit again',
                'type' => SmsTemplate::SMS_TYPE_SALE,
            ],
            [
                'tenant_id' => $tenantId,
                'template_name' => 'GREETING TO CUSTOMER ON SALES RETURN !',
                'content' => 'Hi {customer_name}, Your sales return Id is {sales_return_id}, Sales return Date {sales_return_date}, and Total Amount is {sales_return_amount} Thank you visit again',
                'type' => SmsTemplate::SMS_TYPE_SALE_RETURN,
            ]
        ];
        foreach ($smsTemplates as $smsTemplate) {
            SmsTemplate::create($smsTemplate);
        }

        // Customer
        $customer = Customer::create([
            'tenant_id' => $tenantId,
            'name' => 'walk-in-customer',
            'email' => 'customer@infypos.com',
            'phone' => '123456789',
            'country' => 'india',
            'city' => 'mumbai',
            'address' => 'Dr Deshmukh Marg , mumbai',
        ]);
        // Warehouse
        $warehouse = Warehouse::create([
            'tenant_id' => $tenantId,
            'name' => 'warehouse',
            'phone' => '123456789',
            'country' => 'india',
            'city' => 'mumbai',
            'email' => 'warehouse1@infypos.com',
            'zip_code' => '12345',
        ]);

        $firstCurrencyId = Currency::first()->id;

        $settings = [
            'currency' => $firstCurrencyId,
            'decimal_places' => getSadminSettingValue('decimal_places') ?? 2,
            'thousands_separator' => getSadminSettingValue('thousands_separator') ?? 2,
            'decimal_separator' => getSadminSettingValue('decimal_separator') ?? 1,
            'is_currency_right' =>  getSadminSettingValue('is_currency_right') ?? 0,
            'default_customer' => $customer->id,
            'default_warehouse' => $warehouse->id,
            'date_format' => 'y-m-d',
            'country' => 'India',
            'state' => 'Gujarat',
            'city' => 'Surat',
            // Prefixes
            'purchase_code' => 'PU',
            'purchase_return_code' => 'PR',
            'sale_code' => 'SA',
            'sale_return_code' => 'SR',
            'expense_code' => 'EX',
            // Receipt Settings
            'show_note' => '1',
            'show_phone' => '1',
            'show_customer' => '1',
            'show_address' => '1',
            'show_email' => '1',
            'show_tax_discount_shipping' => '1',
            'show_barcode_in_receipt' => '1',
            'show_logo_in_receipt' => '1',
            'show_product_code' => '1',
            'notes' => 'Thanks for order',
            // use ??
            'show_warehouse' => '1',
            'stripe_key' => '',
            'stripe_secret' => '',
            'sms_gateway' => '1',
            'twillo_sid' => '',
            'twillo_token' => '',
            'twillo_from' => '',
            'smtp_host' => 'mailtrap.io',
            'smtp_port' => '2525',
            'smtp_username' => '',
            'smtp_password' => '',
            'smtp_Encryption' => 'tls',
        ];
        foreach ($settings as $key => $value) {
            Setting::create([
                'tenant_id' => $tenantId,
                'key' => $key,
                'value' => $value
            ]);
        }

        $paymentMethods = [
            [
                'tenant_id' => $tenantId,
                'name' => 'Cash',
                'status' => 1,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Cheque',
                'status' => 1,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Bank Transfer',
                'status' => 1,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Other',
                'status' => 1,
            ],
        ];

        foreach ($paymentMethods as $paymentMethod) {
            PaymentMethod::create($paymentMethod);
        }
    }
}
