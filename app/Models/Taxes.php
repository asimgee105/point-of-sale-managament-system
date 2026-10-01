<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Taxes extends BaseModel
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $fillable = [
        'tenant_id',
        'name',
        'number',
        'status',
    ];

    public static function rules(): array
    {
        return [
            'name' => 'required|unique:taxes,name,NULL,id,tenant_id,' . Auth::user()->tenant_id,
            'number' => 'required',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('taxes.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'name' => $this->name,
            'number' => $this->number,
            'status' => $this->status,
        ];
    }
}
