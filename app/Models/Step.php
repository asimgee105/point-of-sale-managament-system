<?php

namespace App\Models;

use App\Models\Contracts\JsonResourceful;
use App\Traits\HasJsonResourcefulData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Step extends BaseModel implements HasMedia, JsonResourceful
{
    use HasFactory, InteractsWithMedia, HasJsonResourcefulData;

    protected $fillable = [
        'sub_title',
        'title',
        'description',
    ];

    const IMAGE = 'step_image';

    public function getImageAttribute()
    {
        $url = $this->getFirstMediaUrl(self::IMAGE);
        return $url ? $url : asset('images/default/step-1.png');
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
            'sub_title' => $this->sub_title,
            'title' => $this->title,
            'description' => $this->description,
        ];
    }
}
