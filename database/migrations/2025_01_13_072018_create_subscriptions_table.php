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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('plan_id')->nullable();
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->integer('payment_type')->nullable();
            $table->double('plan_amount')->default(0);
            $table->double('payable_amount')->default(0);
            $table->integer('plan_frequency')->default(1)->comment('1 = Weekly, 2 = Monthly, 3 = Yearly, 4 = Unlimited');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->dateTime('trial_ends_at')->nullable();
            $table->boolean('status')->default(2)->comment('0 = Inactive, 1 = Active, 2 = Pending, 3 = Rejected');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')
                ->onUpdate('CASCADE')
                ->onDelete('CASCADE');
            $table->foreign('plan_id')->references('id')->on('plans')
                ->onUpdate('CASCADE')
                ->onDelete('CASCADE');
            $table->foreign('transaction_id')->references('id')->on('transactions')
                ->onUpdate('CASCADE')
                ->onDelete('CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
