<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LoginRegressionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Each test owns an isolated in-memory database, never the user's POS data.
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        app('db')->purge('sqlite');
        Schema::create('users', function (Blueprint $t) {
            $t->id(); $t->string('first_name'); $t->string('last_name')->nullable();
            $t->string('email')->unique(); $t->string('password');
            $t->string('tenant_id')->nullable(); $t->string('language')->default('en');
            $t->boolean('status')->default(true); $t->timestamp('email_verified_at')->nullable();
            $t->boolean('two_factor_enabled')->default(false);
            $t->text('two_factor_secret')->nullable(); $t->text('two_factor_recovery_codes')->nullable();
            $t->rememberToken(); $t->timestamps();
        });
        Schema::create('languages', function (Blueprint $t) {
            $t->id(); $t->string('name'); $t->string('iso_code'); $t->boolean('is_default')->default(false); $t->timestamps();
        });
        foreach (['roles', 'permissions'] as $table) {
            Schema::create($table, function (Blueprint $t) {
                $t->id(); $t->string('name'); $t->string('guard_name');
                $t->string('tenant_id')->nullable(); $t->string('display_name')->nullable(); $t->timestamps();
            });
        }
        Schema::create('model_has_roles', function (Blueprint $t) {
            $t->unsignedBigInteger('role_id'); $t->string('model_type'); $t->unsignedBigInteger('model_id');
        });
        Schema::create('model_has_permissions', function (Blueprint $t) {
            $t->unsignedBigInteger('permission_id'); $t->string('model_type'); $t->unsignedBigInteger('model_id');
        });
        Schema::create('role_has_permissions', function (Blueprint $t) {
            $t->unsignedBigInteger('permission_id'); $t->unsignedBigInteger('role_id');
        });
        Schema::create('media', function (Blueprint $t) {
            $t->id(); $t->morphs('model'); $t->string('collection_name'); $t->unsignedInteger('order_column')->nullable();
        });
        Schema::create('personal_access_tokens', function (Blueprint $t) {
            $t->id(); $t->morphs('tokenable'); $t->string('name'); $t->string('token', 64)->unique();
            $t->text('abilities')->nullable(); $t->timestamp('last_used_at')->nullable();
            $t->timestamp('expires_at')->nullable(); $t->timestamps();
        });
        Cache::flush();
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function account(array $attributes = [], bool $withRole = true): User
    {
        $user = User::create(array_merge([
            'first_name' => 'Asim', 'email' => 'owner@example.test',
            'password' => Hash::make('TestPassword!2026'), 'email_verified_at' => now(), 'status' => true,
        ], $attributes));
        if ($withRole) $user->assignRole(Role::create(['name' => 'superadmin', 'guard_name' => 'web']));
        return $user;
    }

    private function login(array $overrides = [])
    {
        return $this->postJson('/api/login', array_merge([
            'email' => 'owner@example.test', 'password' => 'TestPassword!2026',
        ], $overrides));
    }

    public function test_mixed_case_email_and_absent_language_do_not_crash(): void
    {
        $this->account(['language' => 'missing']);
        $this->login(['email' => '  OWNER@EXAMPLE.TEST  '])->assertOk()->assertJsonPath('data.roles', 'superadmin')
            ->assertJsonPath('data.user.language_id', null);
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_wrong_password_does_not_create_token(): void
    {
        $this->account();
        $this->login(['password' => 'wrong'])->assertStatus(422);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_invalid_email_is_validated(): void
    {
        $this->login(['email' => 'not-an-email'])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_roleless_account_returns_actionable_error(): void
    {
        $this->account([], false);
        $this->login()->assertStatus(403)->assertJsonPath('message', 'No role is assigned to this account. Contact your administrator.');
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_inactive_account_is_rejected(): void
    {
        $this->account(['status' => false]); $this->login()->assertStatus(422);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_unverified_account_is_rejected(): void
    {
        $this->account(['email_verified_at' => null]); $this->login()->assertStatus(422);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_repeated_login_failures_are_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) $this->login(['password' => 'wrong'])->assertStatus(422);
        $this->login(['password' => 'wrong'])->assertStatus(429);
    }

    public function test_otp_cannot_be_used_without_password_challenge(): void
    {
        $this->postJson('/api/two-factor-auth/verify', ['email' => 'owner@example.test', 'otp' => '123456'])
            ->assertStatus(422)->assertJsonValidationErrors('challenge_token');
    }

    public function test_recovery_code_and_challenge_cannot_be_replayed(): void
    {
        $user = $this->account(['two_factor_enabled' => true]);
        $user->forceFill([
            'two_factor_secret' => encrypt(app('pragmarx.google2fa')->generateSecretKey()),
            'two_factor_recovery_codes' => encrypt(json_encode([['code' => 'one-use-recovery-code', 'used' => false]])),
        ])->save();
        $challenge = $this->login()->assertOk()->assertJsonPath('data.two_factor', true)->json('data.challenge_token');
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $payload = ['email' => $user->email, 'otp' => 'one-use-recovery-code', 'challenge_token' => $challenge];
        $this->postJson('/api/two-factor-auth/verify', $payload)->assertOk();
        $this->postJson('/api/two-factor-auth/verify', $payload)->assertStatus(422);
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertTrue(json_decode(decrypt($user->fresh()->two_factor_recovery_codes), true)[0]['used']);
    }

    public function test_unsigned_recovery_code_download_is_rejected(): void
    {
        $this->get('/two-factor-auth/download-recovery-codes/example')->assertForbidden();
    }

    public function test_signed_download_streams_without_writing_public_file(): void
    {
        $user = $this->account();
        $user->forceFill(['two_factor_recovery_codes' => encrypt(json_encode([['code' => 'private-code', 'used' => false]]))])->save();
        $url = URL::temporarySignedRoute('two-factor.download-recovery-codes', now()->addMinutes(5), ['user' => encrypt($user->id)]);
        $response = $this->get($url)->assertOk()->assertDownload('recovery-codes.txt');
        $this->assertStringContainsString('private-code', $response->streamedContent());
        $this->assertFileDoesNotExist(public_path('uploads/2fa/'.$user->id.'/recovery-codes.txt'));
    }

    public function test_public_upgrade_endpoints_are_unavailable(): void
    {
        $this->get('/upgrade/database')->assertNotFound();
        $this->get('/upgrade-to-v1-2-0')->assertNotFound();
    }
    public function test_unknown_challenge_is_rejected(): void
    {
        $this->postJson('/api/two-factor-auth/verify', [
            'email' => 'owner@example.test', 'otp' => '123456', 'challenge_token' => str_repeat('x', 64),
        ])->assertStatus(422);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_public_cache_clear_is_rejected(): void
    {
        $this->getJson('/api/cache-clear')->assertUnauthorized();
    }

    public function test_local_password_reset_preserves_account_controls_and_revokes_tokens(): void
    {
        $user = $this->account(['status' => false, 'email_verified_at' => null, 'two_factor_enabled' => true]);
        $user->createToken('old-session');
        $this->app['env'] = 'local';
        $this->artisan('pos:reset-password', ['email' => 'OWNER@EXAMPLE.TEST'])
            ->expectsQuestion('New password (at least 12 characters)', 'NewPassword!2026')
            ->expectsQuestion('Confirm new password', 'NewPassword!2026')
            ->assertExitCode(0);
        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword!2026', $user->password));
        $this->assertFalse((bool) $user->status);
        $this->assertNull($user->email_verified_at);
        $this->assertTrue((bool) $user->two_factor_enabled);
        $this->assertTrue($user->hasRole('superadmin'));
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_password_reset_command_is_not_available_in_production(): void
    {
        $this->app['env'] = 'production';
        $this->artisan('pos:reset-password', ['email' => 'owner@example.test'])->assertExitCode(1);
    }

    public function test_pdf_generation_works_with_patched_pdf_library(): void
    {
        $bytes = app('dompdf.wrapper')->loadHTML('<html><body><h1>POS Receipt</h1><p>Total: 250.00</p></body></html>')->output();
        $this->assertStringStartsWith('%PDF-', $bytes);
    }

    public function test_negative_sale_quantity_cannot_increase_inventory(): void
    {
        Schema::create('products', function (Blueprint $t) { $t->id(); });
        Schema::create('units', function (Blueprint $t) { $t->id(); });
        app('db')->table('products')->insert(['id' => 1]);
        app('db')->table('units')->insert(['id' => 1]);
        foreach ([0, -2] as $quantity) {
            $validator = app('validator')->make([
                'product_id' => 1, 'product_price' => 200, 'sale_unit' => 1, 'quantity' => $quantity,
            ], \App\Models\SaleItem::$rules);
            $this->assertTrue($validator->fails());
            $this->assertTrue($validator->errors()->has('quantity'));
        }
    }

    public function test_receipt_logo_can_be_read_without_fetching_remote_urls(): void
    {
        $uri = \App\Support\PdfLogo::dataUri('http://127.0.0.1:8000/images/cloudpos-logo.png');
        $this->assertStringStartsWith('data:image/png;base64,', $uri);
        $fallback = \App\Support\PdfLogo::dataUri('http://169.254.169.254/private/no-such-logo.png');
        $this->assertStringStartsWith('data:image/png;base64,', $fallback);
    }

}
