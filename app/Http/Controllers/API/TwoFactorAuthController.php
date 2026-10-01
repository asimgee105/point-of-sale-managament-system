<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Models\User;
use App\Support\LoginResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class TwoFactorAuthController extends AppBaseController
{
    private function generateRecoveryCodes(): array
    {
        return collect(range(1, 8))->map(function () {
            return [
                'used' => false,
                'code' => Str::random(10) . '-' . Str::random(10),
            ];
        })->toArray();
    }

    /**
     * Get the QR code for two-factor authentication.
     *
     * @return JsonResponse
     */
    public function getQrCode(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $google2fa = app('pragmarx.google2fa');

        if (empty($user->two_factor_secret)) {
            $secret = $google2fa->generateSecretKey(16);
            $user->forceFill([
                'two_factor_secret' => encrypt($secret),
                'two_factor_recovery_codes' => encrypt(json_encode($this->generateRecoveryCodes())),
            ])->save();
        }

        $secret = decrypt($user->two_factor_secret);

        $qrCode = $google2fa->getQRCodeInline(
            config('app.name'),
            $user->email,
            $secret,
            200
        );

        return $this->sendResponse([
            'secret' => $secret,
            'qrcode' => $qrCode,
        ], 'QR code retrieved successfully');
    }

    /**
     * Verify the two-factor authentication code.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function enableDisable2FA(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $google2fa = app('pragmarx.google2fa');
        if (! $user->two_factor_secret || ! $user->two_factor_recovery_codes) {
            return $this->sendError('Generate a two-factor setup QR code first.', 422);
        }
        $allCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
        $codes = collect($allCodes)->where('used', false)->pluck('code')->values()->toArray();
        $isValid = false;

        if ($user->two_factor_enabled && in_array($request->otp, $codes)) {
            $isValid = true;
            $user->forceFill([
                'two_factor_recovery_codes' => encrypt(json_encode(array_map(function ($code) use ($request) {
                    if ($code['code'] == $request->otp) {
                        $code['used'] = true;
                    }
                    return $code;
                }, $allCodes))),
            ])->save();
        }
        if (!$isValid) {
            try {
                $secret = decrypt($user->two_factor_secret);
            } catch (\Exception $e) {
                return $this->sendError('2FA secret is corrupted. Please re-enable 2FA.');
            }

            $isValid = $google2fa->verifyKey($secret, $request->otp, 2);
            if (!$isValid) {
                return $this->sendError('Invalid two-factor authentication code');
            }
        }

        if ($user->two_factor_enabled) {
            $user->forceFill([
                'two_factor_secret' => null,
                'two_factor_enabled' => false,
                'two_factor_recovery_codes' => null,
            ])->save();
            return $this->sendResponse(null, 'Two-factor authentication disabled successfully');
        } else {
            $user->forceFill([
                'two_factor_enabled' => true,
            ])->save();

            return $this->sendResponse([
                'recovery_codes' => $codes,
                'download_url' => URL::temporarySignedRoute('two-factor.download-recovery-codes', now()->addMinutes(5), ['user' => encrypt($user->id)])
            ], 'Two-factor authentication enabled successfully');
        }
    }

    public function downloadRecoveryCodes($encryptedUserId)
    {
        $user = User::findOrFail(decrypt($encryptedUserId));

        if (! $user->two_factor_recovery_codes) {
            return $this->sendError('Generate a two-factor setup QR code first.', 422);
        }
        $allCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
        $codes = collect($allCodes)->where('used', false)->pluck('code')->values()->toArray();

        $content = "Two-Factor Authentication Recovery Codes\n\n";
        $content .= "Generated At: ".now()->toDateTimeString()."\n";
        $content .= "Each code can be used once. Store this file privately.\n\n";
        $content .= implode(PHP_EOL, $codes).PHP_EOL;

        return response()->streamDownload(function () use ($content) {
            echo $content;
        }, 'recovery-codes.txt', ['Cache-Control' => 'no-store, private']);
    }

    /**
     * Verify the two-factor authentication code.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|max:64',
            'challenge_token' => 'required|string|size:64',
        ]);

        $key = 'pos:2fa:'.hash('sha256', $request->challenge_token);
        $userId = Cache::get($key);
        if (! $userId) {
            return $this->sendError('Login challenge expired. Sign in again.', 422);
        }

        return DB::transaction(function () use ($request, $key, $userId) {
            $user = User::whereKey($userId)->lockForUpdate()->first();
            if (! Cache::has($key) || ! $user ||
                ! hash_equals(strtolower($user->email), strtolower(trim($request->email))) ||
                ! $user->two_factor_enabled || ! $user->status || ! $user->email_verified_at) {
                return $this->sendError('Invalid login challenge. Sign in again.', 422);
            }

            try {
                $allCodes = json_decode(decrypt($user->two_factor_recovery_codes), true) ?? [];
                $secret = decrypt($user->two_factor_secret);
            } catch (\Exception $e) {
                return $this->sendError('2FA data could not be read. Contact your administrator.', 422);
            }

            $recoveryIndex = null;
            foreach ($allCodes as $index => $code) {
                if (! $code['used'] && hash_equals($code['code'], $request->otp)) {
                    $recoveryIndex = $index;
                    break;
                }
            }

            $isValid = $recoveryIndex !== null ||
                app('pragmarx.google2fa')->verifyKey($secret, $request->otp, 2);
            if (! $isValid) {
                return $this->sendError('The one-time password is invalid. Please try again.', 422);
            }
            if (! $user->roles()->exists()) {
                return $this->sendError('No role is assigned to this account. Contact your administrator.', 403);
            }
            if ($recoveryIndex !== null) {
                $allCodes[$recoveryIndex]['used'] = true;
                $user->forceFill(['two_factor_recovery_codes' => encrypt(json_encode($allCodes))])->save();
            }

            $response = LoginResponse::make($user);
            Cache::forget($key);
            return $response;
        });
    }
}
