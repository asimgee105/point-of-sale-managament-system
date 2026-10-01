<?php

namespace App\Http\Controllers\Sadmin;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\ContactUsCollection;
use App\Http\Resources\ContactUsResource;
use App\Models\ContactUs;
use App\Models\SadminSetting;
use App\Models\Service;
use App\Repositories\ContactUsRepository;
use App\Repositories\SadminSettingRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class FrontCMSAPIController
 */
class FrontCMSAPIController extends AppBaseController
{
    /** @var SadminSettingRepository */
    private $sadminSettingRepository;

    public function __construct(SadminSettingRepository $sadminSettingRepository)
    {
        $this->sadminSettingRepository = $sadminSettingRepository;
    }

    public function getHeroSection(): JsonResponse
    {
        $keyName = [
            'hero_image',
            'hero_title',
            'hero_description',
            'partner_main_title',
            'partner_description',
            'contact_us_main_title',
            'contact_us_description',
            'facebook',
            'twitter',
            'linkedin',
            'phone',
            'email',
            'address',
            'hero_button_title',
            'testimonial_main_title'
        ];
        $settings = SadminSetting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        return $this->sendResponse($settings, 'Hero Section Retrieved Successfully');
    }

    public function updateHeroSection(Request $request)
    {
        $validated = $request->validate([
            'hero_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'hero_title' => 'required',
            'hero_description' => 'required',
            'partner_main_title' => 'required',
            'partner_description' => 'required',
            'contact_us_main_title' => 'required',
            'contact_us_description' => 'required',
            'hero_button_title' => 'required',
            'testimonial_main_title' => 'required',
            'address' => 'required',
            'phone' => 'required',
            'email' => 'required',
            'facebook' => 'nullable|url',
            'twitter' => 'nullable|url',
            'linkedin' => 'nullable|url',
        ]);


        if (isset($validated['hero_image']) && !empty($validated['hero_image'])) {
            /** @var SadminSetting $setting */
            $setting = SadminSetting::where('key', 'hero_image')->first();
            if ($setting === null) {
                $setting = SadminSetting::create(['key' => 'hero_image']);
            }
            $setting->clearMediaCollection(SadminSetting::HERO_IMAGE);
            $media = $setting->addMedia($validated['hero_image'])->toMediaCollection(SadminSetting::HERO_IMAGE, config('app.media_disc'));
            $setting = $setting->refresh();
            $setting->update(['value' => $media->getFullUrl()]);
            unset($validated['hero_image']);
        }

        foreach ($validated as $key => $value) {
            SadminSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return $this->sendSuccess(__('messages.success.hero_section_updated'));
    }

    public function getServices(): JsonResponse
    {
        $services = Service::all()->map(function ($service) {
            return [
                'id' => $service->id,
                'title' => $service->title,
                'description' => $service->description,
                'icon' => $service->icon,
            ];
        });

        return $this->sendResponse($services, 'Services Retrieved Successfully');
    }

    public function getService(Service $service): JsonResponse
    {
        return $this->sendResponse($service, 'Service Retrieved Successfully');
    }

    public function updateServices(Request $request, Service $service)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'icon' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);


        $service->update($validated);

        if (isset($validated['icon']) && !empty($validated['icon'])) {
            $service->clearMediaCollection(Service::ICON);
            $service->addMedia($validated['icon'])->toMediaCollection(Service::ICON, config('app.media_disc'));
        }

        return $this->sendSuccess(__('messages.success.service_updated'));
    }

    public function getPages(): JsonResponse
    {
        $keyName = [
            'term_and_condition',
            'privacy_policy',
            'refund_policy'
        ];
        $settings = SadminSetting::whereIn('key', $keyName)->pluck('value', 'key')->toArray();
        return $this->sendResponse($settings, 'Pages Retrieved Successfully');
    }

    public function updatePages(Request $request)
    {

        $keyName = [
            'term_and_condition',
            'privacy_policy',
            'refund_policy'
        ];

        foreach ($keyName as $key) {
            if (isset($request[$key])) {
                SadminSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $request[$key]]
                );
            }
        }

        return $this->sendSuccess(__('messages.success.pages_updated'));
    }

    public function contactUs(Request $request): ContactUsCollection
    {
        $perPage = getPageSize($request);
        $whyChooseUs = app(ContactUsRepository::class)->paginate($perPage);
        ContactUsResource::usingWithCollection();

        return new ContactUsCollection($whyChooseUs);
    }

    public function deleteContactUs(Request $request): JsonResponse
    {
        $ids = $request->id;
        ContactUs::whereIn('id', $ids)->delete();
        return $this->sendSuccess(__('messages.success.contact_us_deleted'));
    }
}
