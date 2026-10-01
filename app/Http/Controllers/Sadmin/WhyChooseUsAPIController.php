<?php

namespace App\Http\Controllers\Sadmin;

use App\Http\Controllers\AppBaseController;
use App\Http\Resources\WhyChooseUsCollection;
use App\Http\Resources\WhyChooseUsResource;
use App\Models\BusinessInformation;
use App\Models\WhyChooseUs;
use App\Repositories\WhyChooseUsRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WhyChooseUsAPIController extends AppBaseController
{
    /** @var WhyChooseUsRepository */
    private $whyChooseUsRepository;

    public function __construct(WhyChooseUsRepository $whyChooseUsRepository)
    {
        $this->whyChooseUsRepository = $whyChooseUsRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): WhyChooseUsCollection
    {
        $perPage = getPageSize($request);
        $whyChooseUs = $this->whyChooseUsRepository->paginate($perPage);
        WhyChooseUsResource::usingWithCollection();

        return new WhyChooseUsCollection($whyChooseUs);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $whyChooseUs)
    {
        $whyChooseUs = WhyChooseUs::findOrFail($whyChooseUs);

        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);


        try {
            DB::beginTransaction();

            $whyChooseUs->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
            ]);

            if (isset($validated['image']) && !empty($validated['image'])) {
                $whyChooseUs->clearMediaCollection(WhyChooseUs::IMAGE);
                $whyChooseUs->addMedia($validated['image'])->toMediaCollection(WhyChooseUs::IMAGE, config('app.media_disc'));
            }

            DB::commit();

            return $this->sendSuccess(__('messages.success.why_choose_us_updated'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }
}
