<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Transaction extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $fillable = [
        'tenant_id',
        'transaction_id',
        'amount',
        'type',
        'status',
        'meta',
        'user_id',
    ];

    const PAID = 1;

    const UNPAID = 0;

    public function prepareLinks(): array
    {
        return [
            //
        ];
    }

    public function prepareAttributes(): array
    {
        $user = $this->user()->withoutGlobalScopes()->with('subscriptions.plan.currency')->first();
        return [
            'user_name' => $this->user()->withoutGlobalScopes()->first()->full_name ?? '',
            'transaction_id' => $this->transaction_id,
            'amount' => $this->amount,
            'type' => $this->type,
            'status' => $this->status,
            'meta' => $this->meta,
            'subscription' => $user->subscriptions,
            'currency' => $user->plan->currency->symbol ?? '₹',
            'created_at' => $this->created_at,
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(MultiTenant::class, 'tenant_id');
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id')->withoutGlobalScopes();
    }
}
