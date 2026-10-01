<?php

namespace App\Http\Controllers\Sadmin;

use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\StepCollection;
use App\Http\Resources\StepResource;
use App\Models\Step;
use App\Repositories\StepRepository;
use Exception;
use Illuminate\Support\Facades\DB;

class StepAPIController extends AppBaseController
{
    /** @var StepRepository */
    private $stepRepository;

    public function __construct(StepRepository $stepRepository)
    {
        $this->stepRepository = $stepRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): StepCollection
    {
        $perPage = getPageSize($request);
        $whyChooseUs = $this->stepRepository->paginate($perPage);
        StepResource::usingWithCollection();

        return new StepCollection($whyChooseUs);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Step $step)
    {
        $validated = $request->validate([
            'title' => 'required',
            'sub_title' => 'required',
            'description' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $step->update([
                'title' => $validated['title'],
                'sub_title' => $validated['sub_title'],
                'description' => $validated['description'],
            ]);

            if (isset($validated['image']) && !empty($validated['image'])) {
                $step->clearMediaCollection(Step::IMAGE);
                $step->addMedia($validated['image'])->toMediaCollection(Step::IMAGE, config('app.media_disc'));
            }

            DB::commit();

            return $this->sendSuccess(__('messages.success.step_updated'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }
}
