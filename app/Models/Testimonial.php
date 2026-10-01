<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Testimonial extends BaseModel implements HasMedia, JsonResourceful
{
    use HasFactory, InteractsWithMedia, HasJsonResourcefulData;

    protected $fillable = [
        'name',
        'description',
    ];

    const IMAGE = 'testimonial_image';

    public function getImageAttribute()
    {
        $url = $this->getFirstMediaUrl(self::IMAGE);

        return $url ? $url : asset('images/default/testimonial-4.png');
    }

    public function prepareLinks(): array
    {
        return [
            //
        ];
    }

    public function prepareAttributes(): array
    {
        return [
            'image' => $this->image,
            'name' => $this->name,
            'description' => $this->description,
        ];
    }
}
