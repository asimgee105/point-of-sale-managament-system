<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddUserIdInTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $transactions = Transaction::with('tenant')->get();

        foreach ($transactions as $transaction) {
            $user = User::where('email', $transaction->tenant->email)->first();
            $transaction->user_id = $user->id ?? null;
            $transaction->save();
        }
    }
}
