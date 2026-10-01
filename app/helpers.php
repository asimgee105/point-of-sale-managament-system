<?php

use Anuzpandey\LaravelNepaliDate\LaravelNepaliDate;
use App\Models\Currency;
use App\Models\Language;
use App\Models\ManageStock;
use App\Models\Role;
use App\Models\SadminSetting;
use App\Models\Setting;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\Supplier;
use App\Models\User;
use App\Models\UserWarehouse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Mccarlosen\LaravelMpdf\Facades\LaravelMpdf as Mpdf;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

if (! function_exists('getPageSize')) {
    /**
     * @return mixed
     */
    function getPageSize($request)
    {
        return $request->input('page.size', 10);
    }
}

function getAppName(): string
{
    static $appName;

    if (empty($appName)) {
        $appName = getSadminSettingValue('app_name');
    }

    return $appName ?? 'POS';
}

function getAppLogoUrl(): string
{
    static $appLogo;

    if (empty($appLogo)) {
        $appLogo = SadminSetting::where('key', 'app_logo')->first();
    }

    return $appLogo->value ?? asset('images/cloudpos-logo.png');
}

function getAppFaviconUrl(): string
{
    static $appFavicon;

    if (empty($appFavicon)) {
        $appFavicon = SadminSetting::where('key', 'app_favicon')->first();
    }

    return $appFavicon->value ?? asset('images/cloudpos-icon.svg');
}

function getStoreLogo(): string
{
    static $appStoreLogo;

    if (empty($appStoreLogo)) {
        $appStoreLogo = getSettingValue('store_logo') ?? getAppLogoUrl();
    }

    return $appStoreLogo ?? getAppLogoUrl();
}

if (! function_exists('getSettingValue')) {
    /**
     * @return mixed
     */
    function getSettingValue($keyName)
    {
        $key = 'setting' . '-' . $keyName;

        static $settingValues;

        if (isset($settingValues[$key])) {
            return $settingValues[$key];
        }

        /** @var Setting $setting */
        $setting = Setting::where('key', $keyName)->first();
        $settingValues[$key] = $setting->value ?? null;

        return $settingValues[$key];
    }
}

function canDelete(array $models, string $columnName, int $id): bool
{
    foreach ($models as $model) {
        $result = $model::where($columnName, $id)->exists();

        if ($result) {
            return true;
        }
    }

    return false;
}

function getCurrencyCode()
{
    $currencyId = Setting::where('key', '=', 'currency')->first()->value;

    return Currency::whereId($currencyId)->first()->symbol;
}

function getLoginUserLanguage(): string
{
    return \Illuminate\Support\Facades\Auth::user()->language ?? 'en';
}

if (! function_exists('manageStock')) {
    /**
     * @param $request
     * @return mixed
     */
    function manageStock($warehouseID, $productID, $qty = 0)
    {
        $product = ManageStock::whereWarehouseId($warehouseID)
            ->whereProductId($productID)
            ->first();

        if ($product) {
            $totalQuantity = $product->quantity + $qty;

            if (($product->quantity + $qty) < 0) {
                $totalQuantity = 0;
            }
            $product->update([
                'quantity' => $totalQuantity,
            ]);
        } else {
            if ($qty < 0) {
                $qty = 0;
            }

            ManageStock::create([
                'warehouse_id' => $warehouseID,
                'product_id' => $productID,
                'quantity' => $qty,
            ]);
        }
    }
}

if (! function_exists('keyExist')) {
    function keyExist($key)
    {
        $exists = Setting::where('key', $key)->exists();

        return $exists;
    }
}

function getSupplierGrandTotalFilterIds($search)
{
    $supplierData = Supplier::with('purchases')->get();
    $ids = [];
    foreach ($supplierData as $key => $supplier) {
        $value = $supplier->purchases->sum('grand_total');
        if ($search != '') {
            if ($value == $search) {
                $ids[] = $supplier->id;
            }
        }
    }

    return $ids;
}

if (! function_exists('replaceArrayValue')) {
    function replaceArrayValue(&$array, $key, $replaceValue)
    {
        foreach ($array as $index => $value) {
            if (is_array($value)) {
                $array[$index] = replaceArrayValue($value, $key, $replaceValue);
            }
            if ($index == $key) {
                $array[$index] = $replaceValue;
            }
        }

        return $array;
    }
}

if (! function_exists('getLogo')) {
    function getLogo()
    {
        /** @var Setting $setting */
        $logoImage = Setting::where('key', '=', 'logo')->first()->value;

        $logo = '';
        if (File::exists(asset($logoImage))) {
            $logo = base64_encode(file_get_contents(asset($logoImage)));
        }

        return 'data:image/png;base64,' . $logo;
    }
}

if (! function_exists('currencyAlignment')) {
    function currencyAlignment($amount)
    {
        if ($amount === null || $amount === '') {
            $amount = 0;
        }

        // Clean amount (remove commas, spaces etc.)
        $amount = preg_replace('/[^\d.-]/', '', $amount);
        $amount = (float) $amount; // convert to float safely

        // Settings maps
        $thousandsMap = [
            1 => ".",
            2 => ",",
            3 => " ",
            4 => "",
        ];

        $decimalMap = [
            1 => ".",
            2 => ",",
        ];

        // Get settings
        $decimal_places     = (int) (getSettingValue('decimal_places') ?? 2);
        $decimal_separator  = (int) (getSettingValue('decimal_separator') ?? 1);
        $thousands_separator = (int) (getSettingValue('thousands_separator') ?? 2);

        $decimalSep  = $decimalMap[$decimal_separator] ?? ".";
        $thousandSep = $thousandsMap[$thousands_separator] ?? ",";

        // Format number
        $formatted = number_format($amount, $decimal_places, $decimalSep, $thousandSep);

        // Currency placement
        if (getSettingValue('is_currency_right') != 1) {
            return getCurrencyCode() . ' ' . $formatted;
        }

        return $formatted . ' ' . getCurrencyCode();
    }
}

// if (! function_exists('currencyAlignment')) {
//     function currencyAlignment($amount)
//     {
//         if (getSettingValue('is_currency_right') != 1) {
//             return getCurrencyCode() . ' ' . $amount;
//         }

//         return $amount . ' ' . getCurrencyCode();
//     }
// }

if (! function_exists('currentTenantId')) {
    function currentTenantId()
    {
        static $currentTenantId;
        if (empty($currentTenantId) && Auth::check()) {
            $currentTenantId = Auth::user()->tenant_id;
        }

        return $currentTenantId;
    }
}

if (! function_exists('getSadminSettingValue')) {
    /**
     * @return mixed
     */
    function getSadminSettingValue($keyName)
    {
        $key = 'sadmin-setting' . '-' . $keyName;

        static $sadminSettingValues;

        if (isset($sadminSettingValues[$key])) {
            return $sadminSettingValues[$key];
        }

        /** @var SadminSetting $sadminSetting */
        $sadminSetting = SadminSetting::where('key', '=', $keyName)->first();
        $sadminSettingValues[$key] = $sadminSetting->value ?? null;

        return $sadminSettingValues[$key];
    }
}
function getPayPalSupportedCurrencies()
{
    return [
        'AUD',
        'BRL',
        'CAD',
        'CNY',
        'CZK',
        'DKK',
        'EUR',
        'HKD',
        'HUF',
        'ILS',
        'JPY',
        'MYR',
        'MXN',
        'TWD',
        'NZD',
        'NOK',
        'PHP',
        'PLN',
        'GBP',
        'RUB',
        'SGD',
        'SEK',
        'CHF',
        'THB',
        'USD',
    ];
}

if (!function_exists('getPlanFeature')) {
    function getPlanFeature($plan): array
    {
        $features = $plan->planFeature->getFillable();
        $planFeatures = [];
        foreach ($features as $feature) {
            $planFeatures[$feature] = $plan->planFeature->$feature;
        }
        arsort($planFeatures);

        return Arr::except($planFeatures, 'plan_id');
    }
}


if (!function_exists('getLoginUser')) {
    function getLoginUser()
    {
        $userId = session('auth');
        if ($userId) {
            return User::find($userId);
        }
        return null;
    }
}

if (!function_exists('isAdmin')) {
    function isAdmin()
    {
        $user = Auth::user();
        if ($user) {
            return $user->hasRole(Role::ADMIN);
        }
        return false;
    }
}

if (!function_exists('getLoginUserWarehouseIds')) {
    function getLoginUserWarehouseIds()
    {
        $user = Auth::user();
        if ($user) {
            return UserWarehouse::where('user_id', $user->id)->pluck('warehouse_id')->toArray();
        }
        return [];
    }
}


/**
 * @return mixed
 */
if (!function_exists('getCurrentSubscription')) {
    function getCurrentSubscription()
    {
        if (getLoginUser()) {
            $subscription = Subscription::with(['plan'])->where('user_id', getLoginUser()->id)->where('status', Subscription::ACTIVE)->latest()->first();
            return $subscription;
        }
        return null;
    }
}

if (!function_exists('getAllLanguages')) {
    function getAllLanguages()
    {
        if (Schema::hasColumn('languages', 'status')) {
            return Language::where('status', true)->get();
        }

        return Language::all();
    }
}

if (!function_exists('getDefaultLanguage')) {
    function getDefaultLanguage()
    {
        if (Schema::hasColumn('languages', 'is_default')) {
            return Language::where('is_default', true)->first();
        }

        return Language::first();
    }
}

if (!function_exists('getLocalLanguage')) {

    function getLocalLanguage()
    {
        $language = session()->get('locale');
        if (!$language) {
            $user = User::find(session()->get('auth'));
            if ($user) {
                $language = $user->language;
            }
        }

        return $language ?? getDefaultLanguage()->iso_code;
    }
}

if (!function_exists('getActiveStore')) {
    function getActiveStore()
    {
        if (Auth::check() && Auth::user()->tenant_id) {
            return Store::where('tenant_id', Auth::user()->tenant_id)->first();
        }
        return null;
    }
}

if (!function_exists('getActiveStoreName')) {
    function getActiveStoreName()
    {
        if (Auth::check() && Auth::user()->tenant_id) {
            $store = Store::where('tenant_id', Auth::user()->tenant_id)->first();
            return $store->name ?? (getSettingValue('store_name') ?? null);
        }
        return getSettingValue('store_name') ?? null;
    }
}

if (!function_exists('generatePDF')) {
    /**
     * Generate PDF with proper Arabic font support using MPDF
     * 
     * @param string $viewPath Path to the blade template
     * @param array $data Data to pass to the view
     * @param array $config PDF configuration options
     * @return string PDF content
     */
    function generatePDF(string $viewPath, array $data, array $config = []): string
    {
        // Check if this is Arabic language
        if (getLoginUserLanguage() == 'ar') {
            $pdf = Mpdf::loadView($viewPath, $data);
            return $pdf->output();
        } else {
            // Use DomPDF for non-Arabic languages
            $pdf = PDF::loadView($viewPath, $data);
            return $pdf->output();
        }
    }
}

if (!function_exists('verifyCaptcha')) {
    function verifyCaptcha($input)
    {
        // Access controller instance for sendError()
        $controller = app()->make(\App\Http\Controllers\AppBaseController::class);

        if (!isset($input['token']) || empty($input['token'])) {
            return $controller->sendError('Please enter a valid captcha');
        }

        $url = 'https://www.google.com/recaptcha/api/siteverify';
        $data = [
            'secret' => getSadminSettingValue('captcha_secret'),
            'response' => $input['token'],
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? null,
        ];

        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($data),
            ],
        ];

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        $response = json_decode($result, true);

        if (empty($response['success'])) {
            return $controller->sendError('Please enter a valid captcha');
        }

        return true;
    }
}


if (!function_exists('setConfigMailCredentials')) {
    function setConfigMailCredentials()
    {
        $useDynamicSMTP = getSadminSettingValue('APP_USE_DYNAMIC_SMTP') ?? false;
        /** @var \App\Models\User $auth */
        $auth = Auth::user();
        if ($useDynamicSMTP && !$auth->hasRole(Role::SUPER_ADMIN)) {
            $settings = [
                'mail_mailer',
                'mail_host',
                'mail_port',
                'mail_username',
                'mail_password',
                'mail_from_address',
                'mail_encryption',
            ];
            $data = Setting::whereIn('key', $settings)->get()->pluck('value', 'key')->toArray();
            if (!empty($data) && !empty($data['mail_mailer']) && !empty($data['mail_host']) && !empty($data['mail_port']) && !empty($data['mail_username']) && !empty($data['mail_password'])) {
                config([
                    'mail.default'                 => $data['mail_mailer'],
                    'mail.mailers.smtp.host'       => $data['mail_host'],
                    'mail.mailers.smtp.port'       => $data['mail_port'],
                    'mail.mailers.smtp.username'   => $data['mail_username'],
                    'mail.mailers.smtp.password'   => $data['mail_password'],
                    'mail.mailers.smtp.encryption' => $data['mail_encryption'] ?? null,
                    'mail.from.address' => $data['mail_from_address'] ?? getSettingValue('store_email'),
                    'mail.from.name'    => getActiveStoreName(),
                ]);
            }
        } else {
            $data = [
                'mail_mailer' => getSadminSettingValue('APP_MAIL_MAILER') ?? null,
                'mail_host' => getSadminSettingValue('APP_MAIL_HOST') ?? null,
                'mail_port' => getSadminSettingValue('APP_MAIL_PORT') ?? null,
                'mail_username' => getSadminSettingValue('APP_MAIL_USERNAME') ?? null,
                'mail_password' => getSadminSettingValue('APP_MAIL_PASSWORD') ?? null,
            ];
            if (!empty($data['mail_mailer']) && !empty($data['mail_host']) && !empty($data['mail_port']) && !empty($data['mail_username']) && !empty($data['mail_password'])) {
                config([
                    'mail.default'                 => getSadminSettingValue('APP_MAIL_MAILER') ?? env('MAIL_MAILER', 'smtp'),
                    'mail.mailers.smtp.host'       => getSadminSettingValue('APP_MAIL_HOST') ?? env('MAIL_HOST', 'smtp.mailgun.org'),
                    'mail.mailers.smtp.port'       => getSadminSettingValue('APP_MAIL_PORT') ?? env('MAIL_PORT', 587),
                    'mail.mailers.smtp.username'   => getSadminSettingValue('APP_MAIL_USERNAME') ?? env('MAIL_USERNAME'),
                    'mail.mailers.smtp.password'   => getSadminSettingValue('APP_MAIL_PASSWORD') ?? env('MAIL_PASSWORD'),
                    'mail.mailers.smtp.encryption' => getSadminSettingValue('APP_MAIL_ENCRYPTION') ?? env('MAIL_ENCRYPTION', 'tls'),
                    'mail.from.address' => getSadminSettingValue('APP_MAIL_FROM_ADDRESS') ?? env('MAIL_FROM_ADDRESS', getSadminSettingValue('app_email')),
                    'mail.from.name'    => getAppName(),
                ]);
            }
        }
    }
}

if (!function_exists('getFormattedDate')) {
    function getFormattedDate($date)
    {
        $format = getSettingValue('date_format') ?? 'Y-m-d';

        if (empty($date)) {
            return '';
        }

        try {
            $carbonDate = \Carbon\Carbon::parse($date);
        } catch (\Exception $e) {
            return $date;
        }

        /** @var \App\Models\User $auth */
        $auth = Auth::user();
        if ($auth->hasRole(Role::SUPER_ADMIN)) {
            $enableNepali = getSadminSettingValue('enable_nepali_datepicker') === "1" || getSadminSettingValue('enable_nepali_datepicker') === true;
        } else {
            $enableNepali = getSettingValue('enable_nepali_datepicker') === "1" || getSettingValue('enable_nepali_datepicker') === true;
        }

        if ($enableNepali) {
            $bsDate = LaravelNepaliDate::from($carbonDate->format('Y-m-d'))->toNepaliDate();

            [$y, $m, $d] = explode('-', $bsDate);

            $map = [
                'd-m-y' => "$d-$m-$y",
                'm-d-y' => "$m-$d-$y",
                'y-m-d' => "$y-$m-$d",
                'm/d/y' => "$m/$d/$y",
                'd/m/y' => "$d/$m/$y",
                'y/m/d' => "$y/$m/$d",
                'm.d.y' => "$m.$d.$y",
                'd.m.y' => "$d.$m.$y",
                'y.m.d' => "$y.$m.$d",
            ];

            return $map[$format] ?? $bsDate;
        }

        // Otherwise AD formatting
        return $carbonDate->format($format);
    }
}
