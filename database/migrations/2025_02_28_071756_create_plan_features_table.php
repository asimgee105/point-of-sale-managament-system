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
        Schema::create('plan_features', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('plan_id');
            $table->boolean('pos_management')->default(false);
            $table->boolean('reports')->default(false);
            $table->boolean('stock_transfer')->default(false);
            $table->boolean('emails_support')->default(false);
            $table->boolean('sms_support')->default(false);
            $table->boolean('inventory_management')->default(false);
            $table->boolean('adjustments')->default(false);
            $table->boolean('roles_permission')->default(false);
            $table->timestamps();

            $table->foreign('plan_id')->references('id')->on('plans')
                ->onUpdate('CASCADE')
                ->onDelete('CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_features');
    }
};
