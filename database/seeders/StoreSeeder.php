<?php

namespace Database\Seeders;

use App\Models\MultiTenant;
use App\Models\Setting;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenants = MultiTenant::all();
        foreach ($tenants as $tenant) {
            $user = User::where('tenant_id', $tenant->id)->first();
            if ($user) {
                $setting = Setting::where('tenant_id', $user->tenant_id)->where('key', 'store_name')->first();
                $storeExists = Store::where('user_id', $user->id)->where('name', $setting->value ?? 'My Store')->exists();
                if (!$storeExists) {
                    $store = Store::create([
                        'user_id' => $user->id,
                        'tenant_id' => $user->tenant_id,
                        'name' => $setting->value ?? 'My Store',
                    ]);
                    $tenant->update(['store_id' => $store->id]);
                    $allTenantUsers = User::where('tenant_id', $tenant->id)->where('id', '!=', $user->id)->pluck('id');
                    foreach ($allTenantUsers as $userId) {
                        UserStore::create([
                            'user_id' => $userId,
                            'store_id' => $store->id,
                        ]);
                    }
                }
            } else {
                DB::table('tenants')->where('id', $tenant->id)->delete();
            }
        }
    }
}
