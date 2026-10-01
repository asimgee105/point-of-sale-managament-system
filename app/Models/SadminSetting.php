<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * App\Models\SadminSetting
 *
 * @property int $id
 * @property string $key
 * @property string $value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $logo
 * @property-read \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection|Media[] $media
 * @property-read int|null $media_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder|SadminSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|SadminSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|SadminSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder|SadminSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SadminSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SadminSetting whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SadminSetting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|SadminSetting whereValue($value)
 *
 * @mixin \Eloquent
 */
class SadminSetting extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    const PATH = 'sadmin_settings';

    const LOGO = 'app_logo';

    const FAVICON = 'app_favicon';

    const HERO_IMAGE = 'hero_image';

    protected $table = 'sadmin_settings';

    /**
     * @var string[]
     */
    protected $fillable = [
        'key',
        'value',
    ];

    public function getLogoAttribute(): string
    {
        /** @var Media $media */
        $media = $this->media->last();
        if (! empty($media)) {
            return $media->getFullUrl();
        }

        return asset('images/infyom.png');
    }
}
