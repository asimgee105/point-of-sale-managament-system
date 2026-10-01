<?php

namespace App\MediaLibrary;

use App\Models\Brand;
use App\Models\BusinessInformation;
use App\Models\Feature;
use App\Models\MainProduct;
use App\Models\Partner;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purchase;
use App\Models\PurchaseReturn;
use App\Models\SadminSetting;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Step;
use App\Models\Subscription;
use App\Models\Testimonial;
use App\Models\User;
use App\Models\WhyChooseUs;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

/**
 * Class CustomPathGenerator
 */
class CustomPathGenerator implements PathGenerator
{
    public function getPath(Media $media): string
    {
        $path = '{PARENT_DIR}' . DIRECTORY_SEPARATOR . $media->id . DIRECTORY_SEPARATOR;
        switch ($media->collection_name) {
            case Brand::PATH:
                return str_replace('{PARENT_DIR}', Brand::PATH, $path);
            case ProductCategory::PATH:
                return str_replace('{PARENT_DIR}', ProductCategory::PATH, $path);
            case Product::PATH:
                return str_replace('{PARENT_DIR}', Product::PATH, $path);
            case MainProduct::PATH:
                return str_replace('{PARENT_DIR}', MainProduct::PATH, $path);
            case Product::PRODUCT_BARCODE_PATH:
                return str_replace('{PARENT_DIR}', Product::PRODUCT_BARCODE_PATH, $path);
            case User::PATH:
                return str_replace('{PARENT_DIR}', User::PATH, $path);
            case Setting::PATH:
                return str_replace('{PARENT_DIR}', Setting::PATH, $path);
            case Setting::DUAL_SCREEN:
                return str_replace('{PARENT_DIR}', Setting::DUAL_SCREEN, $path);
            case Setting::CLICK_AUDIO:
                return str_replace('{PARENT_DIR}', Setting::CLICK_AUDIO, $path);
            case Purchase::PURCHASE_PDF:
                return str_replace('{PARENT_DIR}', Purchase::PURCHASE_PDF, $path);
            case Sale::SALE_PDF:
                return str_replace('{PARENT_DIR}', Sale::SALE_PDF, $path);
            case PurchaseReturn::PURCHASE_RETURN_PDF:
                return str_replace('{PARENT_DIR}', PurchaseReturn::PURCHASE_RETURN_PDF, $path);
            case SaleReturn::SALE_RETURN_PDF:
                return str_replace('{PARENT_DIR}', SaleReturn::SALE_RETURN_PDF, $path);
            case Sale::SALE_BARCODE_PATH:
                return str_replace('{PARENT_DIR}', Sale::SALE_BARCODE_PATH, $path);
            case SadminSetting::LOGO:
                return str_replace('{PARENT_DIR}', SadminSetting::LOGO, $path);
            case SadminSetting::FAVICON:
                return str_replace('{PARENT_DIR}', SadminSetting::FAVICON, $path);
            case SadminSetting::HERO_IMAGE:
                return str_replace('{PARENT_DIR}', SadminSetting::HERO_IMAGE, $path);
            case Service::ICON:
                return str_replace('{PARENT_DIR}', Service::ICON, $path);
            case Partner::IMAGE:
                return str_replace('{PARENT_DIR}', Partner::IMAGE, $path);
            case BusinessInformation::IMAGE:
                return str_replace('{PARENT_DIR}', BusinessInformation::IMAGE, $path);
            case WhyChooseUs::IMAGE:
                return str_replace('{PARENT_DIR}', WhyChooseUs::IMAGE, $path);
            case Testimonial::IMAGE:
                return str_replace('{PARENT_DIR}', Testimonial::IMAGE, $path);
            case Step::IMAGE:
                return str_replace('{PARENT_DIR}', Step::IMAGE, $path);
            case Feature::IMAGE:
                return str_replace('{PARENT_DIR}', Feature::IMAGE, $path);
            case Subscription::ATTACHMENT:
                return str_replace('{PARENT_DIR}', Subscription::ATTACHMENT, $path);
            case 'default':
                return '';
        }
    }

    public function getPathForConversions(Media $media): string
    {
        return $this->getPath($media) . 'thumbnails/';
    }

    public function getPathForResponsiveImages(Media $media): string
    {
        return $this->getPath($media) . 'rs-images/';
    }
}
