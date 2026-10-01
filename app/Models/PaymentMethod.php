<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class PaymentMethod extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'payment_methods';

    const JSON_API_TYPE = 'payment-methods';

    protected $fillable = [
        'tenant_id',
        'name',
        'status',
    ];

    public static function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:payment_methods,name,NULL,id,tenant_id,' . Auth::user()->tenant_id,
            'status' => 'sometimes|boolean',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            // 'self' => route('products.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'name' => $this->name,
            'status' => $this->status,
        ];
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'payment_type', 'id');
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'payment_type', 'id');
    }

    public function salesReturn()
    {
        return $this->hasMany(SaleReturn::class, 'payment_type', 'id');
    }

    public function purchasesReturn()
    {
        return $this->hasMany(PurchaseReturn::class, 'payment_type', 'id');
    }

    public function salesPayments()
    {
        return $this->hasMany(SalesPayment::class, 'payment_type', 'id');
    }
}
