<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(DefaultCountriesSeeder::class);
        $this->call(DefaultLanguageTableSeeder::class);
        $this->call(AddUserIdInTransactionSeeder::class);
        $this->call(DefaultFrontDataSeeder::class);
        $this->call(DefaultPermissionsSeeder::class);
        $this->call(DefaultUserSeeder::class);
        $this->call(DefaultSettingSeeder::class);
        $this->call(DefaultFeaturesSeeder::class);
        $this->call(GenerateCrudPermissionsSeeder::class);
    }
}
