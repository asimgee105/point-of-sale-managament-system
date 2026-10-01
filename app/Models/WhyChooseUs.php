<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class WhyChooseUs extends BaseModel implements HasMedia, JsonResourceful
{
    use HasFactory, InteractsWithMedia, HasJsonResourcefulData;

    protected $fillable = [
        'title',
        'description',
    ];

    const IMAGE = 'why_choose_image';

    public function getImageAttribute()
    {
        $url = $this->getFirstMediaUrl(self::IMAGE);
        return $url ? $url : asset('images/default/choose-1.png');
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
            'title' => $this->title,
            'description' => $this->description,
        ];
    }
}
