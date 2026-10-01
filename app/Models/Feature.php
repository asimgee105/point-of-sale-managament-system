<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Feature extends BaseModel implements HasMedia, JsonResourceful
{
    use HasFactory, InteractsWithMedia, HasJsonResourcefulData;

    protected $fillable = [
        'title',
        'description',
        'points',
    ];

    const IMAGE = 'feature_image';

    public function getImageAttribute()
    {
        $url = $this->getFirstMediaUrl(self::IMAGE);
        return $url ? $url : asset('images/default/feature-1.png');
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
            'points' => $this->points,
            'description' => $this->description,
        ];
    }
}
