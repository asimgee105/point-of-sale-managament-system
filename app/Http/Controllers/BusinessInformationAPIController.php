<?php

namespace App\Http\Controllers;

use App\Http\Resources\BusinessInformationCollection;
use App\Http\Resources\BusinessInformationResource;
use App\Models\BusinessInformation;
use App\Repositories\BusinessInformationRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BusinessInformationAPIController extends AppBaseController
{
    /** @var BusinessInformationRepository */
    private $businessInformationRepository;

    public function __construct(BusinessInformationRepository $businessInformationRepository)
    {
        $this->businessInformationRepository = $businessInformationRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): BusinessInformationCollection
    {
        $perPage = getPageSize($request);
        $businessInformations = $this->businessInformationRepository->paginate($perPage);
        BusinessInformationResource::usingWithCollection();

        return new BusinessInformationCollection($businessInformations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            DB::beginTransaction();
            $businessInformation = BusinessInformation::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
            ]);
            $businessInformation->addMedia($validated['image'])->toMediaCollection(BusinessInformation::IMAGE, config('app.media_disc'));

            DB::commit();

            return $this->sendSuccess('Business Information Created Successfully');
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    // public function show(string $id)
    // {
    //     //
    // }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BusinessInformation $businessInformation)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $businessInformation->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
            ]);

            if (isset($validated['image']) && !empty($validated['image'])) {
                $businessInformation->clearMediaCollection(BusinessInformation::IMAGE);
                $businessInformation->addMedia($validated['image'])->toMediaCollection(BusinessInformation::IMAGE, config('app.media_disc'));
            }

            DB::commit();

            return $this->sendSuccess('Business Information Updated Successfully');
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BusinessInformation $businessInformation)
    {
        try {
            DB::beginTransaction();
            $businessInformation->delete();
            DB::commit();

            return $this->sendSuccess('Business Information Deleted Successfully');
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }
}
