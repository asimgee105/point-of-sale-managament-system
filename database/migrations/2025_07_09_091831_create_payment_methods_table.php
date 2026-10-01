<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onUpdate('cascade')->onDelete('cascade');
        });

        $tenants = DB::table('tenants')->select('id')->get();

        foreach ($tenants as $tenant) {
            $cashId = DB::table('payment_methods')->insertGetId([
                'tenant_id' => $tenant->id,
                'name' => 'Cash',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $chequeId = DB::table('payment_methods')->insertGetId([
                'tenant_id' => $tenant->id,
                'name' => 'Cheque',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $bankTransferId = DB::table('payment_methods')->insertGetId([
                'tenant_id' => $tenant->id,
                'name' => 'Bank Transfer',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $otherId = DB::table('payment_methods')->insertGetId([
                'tenant_id' => $tenant->id,
                'name' => 'Other',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update existing sales records for this tenant
            // Map old payment_type values to new payment_method IDs
            DB::table('sales')
                ->where('tenant_id', $tenant->id)
                ->where('payment_type', 1) // Old Cash
                ->update(['payment_type' => $cashId]);

            DB::table('sales')
                ->where('tenant_id', $tenant->id)
                ->where('payment_type', 2) // Old Cheque
                ->update(['payment_type' => $chequeId]);

            DB::table('sales')
                ->where('tenant_id', $tenant->id)
                ->where('payment_type', 3) // Old Bank Transfer
                ->update(['payment_type' => $bankTransferId]);

            DB::table('sales')
                ->where('tenant_id', $tenant->id)
                ->where('payment_type', 4) // Old Other
                ->update(['payment_type' => $otherId]);

            // Update existing sales_payments records for this tenant
            DB::table('sales_payments')
                ->where('payment_type', 1) // Old Cash
                ->whereExists(function ($query) use ($tenant) {
                    $query->select(DB::raw(1))
                        ->from('sales')
                        ->whereColumn('sales.id', 'sales_payments.sale_id')
                        ->where('sales.tenant_id', $tenant->id);
                })
                ->update(['payment_type' => $cashId]);

            DB::table('sales_payments')
                ->where('payment_type', 2) // Old Cheque
                ->whereExists(function ($query) use ($tenant) {
                    $query->select(DB::raw(1))
                        ->from('sales')
                        ->whereColumn('sales.id', 'sales_payments.sale_id')
                        ->where('sales.tenant_id', $tenant->id);
                })
                ->update(['payment_type' => $chequeId]);

            DB::table('sales_payments')
                ->where('payment_type', 3) // Old Bank Transfer
                ->whereExists(function ($query) use ($tenant) {
                    $query->select(DB::raw(1))
                        ->from('sales')
                        ->whereColumn('sales.id', 'sales_payments.sale_id')
                        ->where('sales.tenant_id', $tenant->id);
                })
                ->update(['payment_type' => $bankTransferId]);

            DB::table('sales_payments')
                ->where('payment_type', 4) // Old Other
                ->whereExists(function ($query) use ($tenant) {
                    $query->select(DB::raw(1))
                        ->from('sales')
                        ->whereColumn('sales.id', 'sales_payments.sale_id')
                        ->where('sales.tenant_id', $tenant->id);
                })
                ->update(['payment_type' => $otherId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
