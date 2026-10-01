<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ResetLocalPassword extends Command
{
    protected $signature = 'pos:reset-password {email : Existing account email}';

    protected $description = 'Reset an existing local account password using a hidden terminal prompt';

    public function handle(): int
    {
        if (! app()->environment('local')) {
            $this->error('This command is available only when APP_ENV=local.');
            return self::FAILURE;
        }

        $email = Str::lower(trim($this->argument('email')));
        $user = User::withoutGlobalScopes()->whereRaw('LOWER(email) = ?', [$email])->first();
        if (! $user) {
            $this->error('Account not found. Check the database and the account email.');
            return self::FAILURE;
        }

        $password = $this->secret('New password (at least 12 characters)');
        if (! is_string($password) || strlen($password) < 12) {
            $this->error('Use at least 12 characters.');
            return self::FAILURE;
        }
        if ($password !== $this->secret('Confirm new password')) {
            $this->error('Passwords did not match.');
            return self::FAILURE;
        }

        $user->forceFill(['password' => Hash::make($password), 'remember_token' => Str::random(60)])->save();
        $user->tokens()->delete();
        $this->info('Password updated. Sign in with this email and your new password.');
        $this->line('Account status, verification, roles, subscription and 2FA were preserved.');
        return self::SUCCESS;
    }
}
