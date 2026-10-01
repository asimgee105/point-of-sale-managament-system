<?php

namespace App\Http\Controllers\Sadmin;

use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\TestimonialCollection;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use App\Repositories\TestimonialRepository;
use Exception;
use Illuminate\Support\Facades\DB;

class TestimonialAPIController extends AppBaseController
{
    /** @var TestimonialRepository */
    private $testimonialRepository;

    public function __construct(TestimonialRepository $testimonialRepository)
    {
        $this->testimonialRepository = $testimonialRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): TestimonialCollection
    {
        $perPage = getPageSize($request);
        $whyChooseUs = $this->testimonialRepository->paginate($perPage);
        TestimonialResource::usingWithCollection();

        return new TestimonialCollection($whyChooseUs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'required',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);


        try {
            DB::beginTransaction();
            $testimonial = Testimonial::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
            ]);
            $testimonial->addMedia($validated['image'])->toMediaCollection(Testimonial::IMAGE, config('app.media_disc'));

            DB::commit();

            return $this->sendSuccess(__('messages.success.testimonial_created'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Testimonial $testimonial)
    {
        return new TestimonialResource($testimonial);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Testimonial $testimonial)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);


        try {
            DB::beginTransaction();

            $testimonial->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
            ]);

            if (isset($validated['image']) && !empty($validated['image'])) {
                $testimonial->clearMediaCollection(Testimonial::IMAGE);
                $testimonial->addMedia($validated['image'])->toMediaCollection(Testimonial::IMAGE, config('app.media_disc'));
            }

            DB::commit();

            return $this->sendSuccess(__('messages.success.testimonial_updated'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Testimonial $testimonial)
    {

        try {
            DB::beginTransaction();
            $testimonial->delete();
            DB::commit();

            return $this->sendSuccess(__('messages.success.testimonial_deleted'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }
}
