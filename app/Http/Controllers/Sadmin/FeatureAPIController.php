<?php

namespace App\Http\Controllers\Sadmin;

use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\FeatureCollection;
use App\Http\Resources\FeatureResource;
use App\Models\Feature;
use App\Repositories\FeatureRepository;
use Exception;
use Illuminate\Support\Facades\DB;

class FeatureAPIController extends AppBaseController
{
    /** @var FeatureRepository */
    private $featureRepository;

    public function __construct(FeatureRepository $featureRepository)
    {
        $this->featureRepository = $featureRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): FeatureCollection
    {
        $perPage = getPageSize($request);
        $whyChooseUs = $this->featureRepository->paginate($perPage);
        FeatureResource::usingWithCollection();

        return new FeatureCollection($whyChooseUs);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Feature $feature)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'points' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $feature->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'points' => $validated['points'],
            ]);

            if (isset($validated['image']) && !empty($validated['image'])) {
                $feature->clearMediaCollection(Feature::IMAGE);
                $feature->addMedia($validated['image'])->toMediaCollection(Feature::IMAGE, config('app.media_disc'));
            }

            DB::commit();

            return $this->sendSuccess(__('messages.success.feature_updated'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }
}
