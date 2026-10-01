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
        Schema::create('adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable();
            $table->date('date');
            $table->string('reference_code')->nullable();
            $table->unsignedBigInteger('warehouse_id');
            $table->integer('total_products')->nullable();
            $table->foreign('warehouse_id')->references('id')
                ->on('warehouses')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->timestamps();

            $table->foreign('tenant_id')
                ->references('id')->on('tenants')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adjustments');
    }
};
