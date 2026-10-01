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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('currency_id');
            $table->string('name');
            $table->double('price');
            $table->integer('frequency')->default(1)->comment('1 = Weekly, 2 = Monthly, 3 = Yearly, 4 = Unlimited');
            $table->boolean('assign_while_register')->default(false);
            $table->integer('trial_days')->nullable();
            $table->timestamps();

            $table->foreign('currency_id')->references('id')->on('currencies')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
