<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class DefaultLanguageTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Language::create(['name' => 'English', 'iso_code' => 'en', 'is_default' => true, 'status' => true]);
        Language::create(['name' => 'Chinese', 'iso_code' => 'cn', 'is_default' => false, 'status' => true]);
        Language::create(['name' => 'French', 'iso_code' => 'fr', 'is_default' => false, 'status' => true]);
        Language::create(['name' => 'German', 'iso_code' => 'gr', 'is_default' => false, 'status' => true]);
        Language::create(['name' => 'Spanish', 'iso_code' => 'sp', 'is_default' => false, 'status' => true]);
        Language::create(['name' => 'Turkish', 'iso_code' => 'tr', 'is_default' => false, 'status' => true]);
        Language::create(['name' => 'Arabic', 'iso_code' => 'ar', 'is_default' => false, 'status' => true]);
        Language::create(['name' => 'Vietnamese', 'iso_code' => 'vi', 'is_default' => false, 'status' => true]);
    }
}
