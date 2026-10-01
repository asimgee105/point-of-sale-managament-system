<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ContactUs extends BaseModel implements JsonResourceful
{
    use HasFactory, HasJsonResourcefulData;

    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
    ];

    public function prepareLinks(): array
    {
        return [
            //
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'subject' => $this->subject,
            'message' => $this->message,
            'created_at' => $this->created_at,
        ];
    }
}
