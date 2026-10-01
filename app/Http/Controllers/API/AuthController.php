<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\RegisterRequest;
use App\Models\Language;
use App\Models\MultiTenant;
use App\Models\Plan;
use App\Models\Role;
use App\Models\SadminSetting;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Repositories\AdminRepository;
use App\Repositories\SubscriptionRepository;
use App\Support\LoginResponse;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Contracts\Auth\Factory as AuthFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;

class AuthController extends AppBaseController
{
    /**
     * The authentication factory implementation.
     *
     * @var \Illuminate\Contracts\Auth\Factory
     */
    protected $auth;

    /**
     * The number of minutes tokens should be allowed to remain valid.
     *
     * @var int
     */
    protected $expiration;

    /**
     * The provider name.
     *
     * @var string
     */
    protected $provider;

    /**
     * Create a new guard instance.
     *
     * @return void
     */
    public function __construct(AuthFactory $auth, int $expiration = null, string $provider = null)
    {
        $this->auth = $auth;
        $this->expiration = config('sanctum.expiration');
        $this->provider = $provider;
    }

    /**
     * @return mixed
     */
    public function login(Request $request)
    {
        app()->setLocale($request->language_code ?? 'en');
        $request->validate(['email' => 'required|email|max:255', 'password' => 'required|string|max:1024']);
        $email = Str::lower(trim($request->input('email')));
        $password = $request->input('password');
        $user = User::whereRaw('lower(email) = ?', [$email])->first();

        if (empty($user)) {
            return $this->sendError(__('messages.error.invalid_username_password'), 422);
        }

        if (! Hash::check($password, $user->password)) {
            return $this->sendError(__('messages.error.invalid_username_password'), 422);
        }

        if ($user->email_verified_at == null) {
            return $this->sendError(__('messages.error.email_not_verified'), 422);
        }

        if (!$user->status) {
            return $this->sendError(__('messages.error.status_inactive'), 422);
        }

        if ($user->two_factor_enabled) {
            $challenge = Str::random(64);
            Cache::put('pos:2fa:'.hash('sha256', $challenge), $user->id, now()->addMinutes(5));
            return  response()->json([
                'data' => [
                    'user_email' => $user->email,
                    'two_factor' => true,
                    'challenge_token' => $challenge,
                ],
                'message' => 'Please enter one-time code to complete login.',
            ]);
        }

        return LoginResponse::make($user);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        app()->setLocale($request->language_code ?? 'en');
        $input = $request->validated();
        $input['password'] = Hash::make($input['password']);
        $fullName = explode(' ', $input['full_name']);
        $input['first_name'] = $fullName[0];
        $input['last_name'] = $fullName[1] ?? '';
        if (getSadminSettingValue('captcha_enabled') == 1) {
            $captchaResult = verifyCaptcha($input);
            if ($captchaResult !== true) {
                return $captchaResult;
            }
        }

        try {
            DB::beginTransaction();

            $defaultLanguage = Language::where('is_default', 1)->first();
            $input['language'] = $defaultLanguage->iso_code ?? 'en';
            $user = User::create($input);
            $user->assignRole(Role::ADMIN);

            $store = Store::create([
                'name' => 'My Store',
                'user_id' => $user->id,
            ]);
            $tenant = MultiTenant::create(['store_id' => $store->id]);
            $store->update(['tenant_id' => $tenant->id]);
            $user->update(['tenant_id' => $tenant->id]);

            $plan = Plan::where('assign_while_register', true)->first();

            if ($plan) {
                SubscriptionRepository::createSubscription([
                    'plan_id' => $plan->id,
                    'user_id' => $user->id,
                    'payment_type' => Subscription::TYPE_FREE,
                ]);
            }

            $sadminSettingRow = SadminSetting::where('key', 'send_registration_mail')->first();
            $sadminSetting = $sadminSettingRow ? filter_var($sadminSettingRow->value, FILTER_VALIDATE_BOOLEAN) : true;
            if ($sadminSetting) {
                $user->sendEmailVerificationNotification();
            } else {
                $user->email_verified_at = now();
                $user->save();
            }

            App::make(AdminRepository::class)->defaultSettings($tenant->id);

            $success['token'] = $user->createToken('token')->plainTextToken;
            $success['name'] = $user->name;

            DB::commit();
            return $this->sendResponse($success, 'User registered successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            return $this->sendError($e->getMessage());
        }
    }

    public function logout(): JsonResponse
    {
        Session::forget('auth');
        Session::flush();

        $token = auth()->user()->currentAccessToken();
        if ($token instanceof \Laravel\Sanctum\PersonalAccessToken) {
            $token->delete();
        }

        return $this->sendSuccess('Logout Successfully');
    }

    public function sendPasswordResetLinkEmail(Request $request): JsonResponse
    {
        app()->setLocale($request->language_code ?? 'en');

        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );
        $user = User::whereEmail($request->email)->first();
        if (! $user) {
            return $this->sendError(__('messages.error.user_not_found'));
        }

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 200);
        } else {
            throw ValidationException::withMessages([
                'email' => __('messages.error.wait_try_again'),
            ]);
        }
    }

    public function emailVerification(Request $request)
    {
        // Check if the URL signature is valid and not expired
        if (! URL::hasValidSignature($request)) {
            return redirect()->route('email-verify')
                ->with('success', false)
                ->with('message', __('messages.error.email_verify_link_expired'));
        }

        $user = User::findOrFail($request->id);

        // Verify the hash matches the user's email
        if (! hash_equals(sha1($user->email), $request->hash)) {
            return redirect()->route('email-verify')
                ->with('success', false)
                ->with('message', __('messages.error.email_verify_link_invalid'));
        }

        // If already verified, inform the user
        if ($user->hasVerifiedEmail()) {
            return redirect()->route('email-verify')
                ->with('success', false)
                ->with('message', __('messages.error.email_already_verified'));
        }

        // Mark the email as verified
        $user->markEmailAsVerified();

        return redirect()->route('email-verify')
            ->with('success', true)
            ->with('message', __('messages.success.email_verified_successfully'));
    }

    public function viewEmailVerification(Request $request)
    {
        $message = session('message', '');
        $success = session('success', false);

        if (empty($message)) {
            return redirect()->route('app');
        }

        return view('web.email-verify', compact('success', 'message'));
    }

    public function resetPassword(Request $request): JsonResponse
    {
        app()->setLocale($request->language_code ?? 'en');

        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:12|max:1024|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 200);
        } else {
            throw ValidationException::withMessages([
                'email' => __($status),
            ]);
        }
    }

    public function isValidToken(Request $request): JsonResponse
    {
        if ($token = $request->bearerToken()) {
            $model = Sanctum::$personalAccessTokenModel;

            $accessToken = $model::findToken($token);
            $valid = $this->isValidAccessToken($accessToken);

            return response()->json(['success' => __($valid)], 200);
        }
    }

    /**
     * Determine if the provided access token is valid.
     *
     * @param  mixed  $accessToken
     */
    protected function isValidAccessToken($accessToken): bool
    {
        if (! $accessToken) {
            return false;
        }

        $isValid =
            (! $this->expiration || $accessToken->created_at->gt(now()->subMinutes($this->expiration)))
            && $this->hasValidProvider($accessToken->tokenable);

        if (is_callable(Sanctum::$accessTokenAuthenticationCallback)) {
            $isValid = (bool) (Sanctum::$accessTokenAuthenticationCallback)($accessToken, $isValid);
        }

        return $isValid;
    }

    /**
     * Determine if the tokenable model matches the provider's model type.
     */
    protected function hasValidProvider(Model $tokenable): bool
    {
        if (is_null($this->provider)) {
            return true;
        }

        $model = config("auth.providers.{$this->provider}.model");

        return $tokenable instanceof $model;
    }
}
