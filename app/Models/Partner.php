<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Partner extends BaseModel implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name'
    ];

    const IMAGE = 'partner_img';

    public function getImageAttribute()
    {
        $url = $this->getFirstMediaUrl(self::IMAGE);
        return $url ? $url : getAppLogoUrl();
    }
}
