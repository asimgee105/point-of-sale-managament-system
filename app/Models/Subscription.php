<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Subscription extends Model implements JsonResourceful, HasMedia
{
    use HasFactory, HasJsonResourcefulData, InteractsWithMedia;

    protected $fillable = [
        'user_id',
        'plan_id',
        'transaction_id',
        'payment_type',
        'plan_amount',
        'payable_amount',
        'plan_frequency',
        'start_date',
        'end_date',
        'trial_ends_at',
        'status',
        'is_paid',
        'data',
        'notes',
    ];

    const ATTACHMENT = 'attachment';

    const INACTIVE = 0;

    const ACTIVE = 1;

    const PENDING = 2;

    const REJECTED = 3;

    const STATUS = [
        self::INACTIVE => 'Inactive',
        self::ACTIVE => 'Active',
        self::PENDING => 'Pending',
        self::REJECTED => 'Rejected',
    ];

    const TYPE_FREE = 0;

    const TYPE_STRIPE = 1;

    const TYPE_PAYPAL = 2;

    const TYPE_MANUAL = 3;

    const TYPE_RAZORPAY = 4;

    const TYPE_PAYSTACK = 5;

    const PAYMENT_TYPES = [
        self::TYPE_FREE => 'Free',
        self::TYPE_STRIPE => 'Stripe',
        self::TYPE_PAYPAL => 'PayPal',
        self::TYPE_MANUAL => 'Manual',
        self::TYPE_RAZORPAY => 'RazorPay',
        self::TYPE_PAYSTACK => 'Paystack',
    ];

    public function prepareLinks(): array
    {
        return [
            'self' => route('subscriptions.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'user_name' => $this->user()->withoutGlobalScopes()->first()->full_name ?? '',
            'plan_name' => $this->plan->name,
            'payment_type' => $this->payment_type,
            'transaction_id' => $this->transaction_id,
            'transaction_date' => $this->transaction->created_at ?? null,
            'plan_amount' => $this->plan_amount,
            'payable_amount' => $this->payable_amount,
            'plan_frequency' => $this->plan_frequency,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'trial_ends_at' => $this->trial_ends_at,
            'currency_symbol' => $this->plan->currency->symbol,
            'status' => $this->isExpired() ? self::INACTIVE : $this->status,
            'notes' => $this->notes ?? null,
            'attachment' => $this->attachment_url,
        ];
    }

    public function getAttachmentUrlAttribute()
    {
        $media = $this->getMedia(self::ATTACHMENT)->first();
        if ($media) {
            return $media->getFullUrl();
        }
        return null;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id')->withoutGlobalScopes();
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function isExpired(): bool
    {
        $now = Carbon::now();

        if ($this->end_date > $now) {
            return false;
        }

        if ((! empty($this->trial_ends_at) && $this->trial_ends_at < $now) || $this->end_date < $now) {
            return true;
        }

        return false;
    }
}
