<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = ['product_categories', 'variations', 'brands', 'units', 'products', 'customers', 'users', 'suppliers', 'warehouses', 'mail_templates', 'sms_templates'];
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->boolean('is_default')->default(false)->before('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['product_categories', 'variations', 'brands', 'units', 'products', 'customers', 'users', 'suppliers', 'warehouses', 'mail_templates', 'sms_templates'];
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('is_default');
            });
        }
    }
};
