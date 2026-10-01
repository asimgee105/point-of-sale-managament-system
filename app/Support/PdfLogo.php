<?php

namespace App\Support;

use Intervention\Image\Laravel\Facades\Image;

class PdfLogo
{
    public static function dataUri(string $url): string
    {
        $fallback = public_path('images/cloudpos-logo.png');
        $path = rawurldecode(parse_url($url, PHP_URL_PATH) ?: '');
        $candidate = realpath(public_path(ltrim($path, '/')));
        $publicRoot = realpath(public_path()).DIRECTORY_SEPARATOR;
        $storagePath = realpath(storage_path('app/public'));
        $storageRoot = $storagePath ? $storagePath.DIRECTORY_SEPARATOR : null;
        if (! $candidate ||
            (! str_starts_with($candidate, $publicRoot) && (! $storageRoot || ! str_starts_with($candidate, $storageRoot))) ||
            ! is_file($candidate) || filesize($candidate) > 5 * 1024 * 1024) {
            $candidate = $fallback;
        }

        $size = @getimagesize($candidate);
        if (! $size || $size[0] * $size[1] > 16000000) {
            $candidate = $fallback;
        }

        // Use local bytes: PDF rendering must not fetch arbitrary logo URLs.
        return Image::read($candidate)->toPng()->toDataUri();
    }
}
