<?php

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\MultiTenant;
use App\Models\Permission;
use App\Models\Plan;
use App\Models\Role as ModelsRole;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DefaultUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Super Admin
        Role::create([
            'name' => ModelsRole::SUPER_ADMIN,
            'display_name' => 'Super Admin',
        ]);
        // $superAdminTenant = MultiTenant::create(['email' => 'superadmin@infy-pos.com']);
        $input = [
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'superadmin@infy-pos.com',
            'email_verified_at' => Carbon::now(),
            'password' => Hash::make('Admin@123'),
            'tenant_id' => null,
        ];
        $admin = User::create($input);
        $admin->assignRole(ModelsRole::SUPER_ADMIN);


        // Admin User
        $adminRole = Role::create([
            'name' => ModelsRole::ADMIN,
            'display_name' => ' Admin',
        ]);
        $allPermissions = Permission::pluck('name', 'id');
        $adminRole->givePermissionTo($allPermissions);

        $input = [
            'first_name' => 'admin',
            'last_name' => 'admin',
            'email' => 'admin@infy-pos.com',
            'phone' => '919999999999',
            'email_verified_at' => Carbon::now(),
            'password' => Hash::make('Admin@123'),
            'tenant_id' => null,
        ];

        $user = User::create($input);
        $user->assignRole($adminRole);

        $store = Store::create([
            'name' => 'My Store',
            'user_id' => $user->id,
        ]);
        $tenant = MultiTenant::create(['store_id' => $store->id]);
        $store->update(['tenant_id' => $tenant->id]);
        $user->update(['tenant_id' => $tenant->id]);

        $this->command?->info('Use php artisan pos:reset-password for each seeded account to set your own password.');

        // Currency
        $currency = Currency::create([
            'name' => 'India',
            'code' => 'INR',
            'symbol' => '₹',
        ]);

        // Plan
        $plan = Plan::create([
            'name' => 'Default Plan',
            'price' => 0,
            'frequency' => Plan::WEEKLY,
            'assign_while_register' => 1,
            'currency_id' => $currency->id,
        ]);

        $plan->planFeature()->create([
            'pos_management' => 1,
            'reports' => 1,
            'emails_support' => 1,
            'sms_support' => 1,
            'inventory_management' => 1,
            'adjustments' => 1,
            'roles_permission' => 1,
        ]);

        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'payment_type' => Subscription::TYPE_FREE,
            'plan_amount' => $plan->price,
            'payable_amount' => $plan->price,
            'plan_frequency' => Plan::WEEKLY,
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7)->endOfDay(),
            'status' => Subscription::ACTIVE,
        ]);
    }
}
