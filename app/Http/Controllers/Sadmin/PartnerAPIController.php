<?php

namespace App\Http\Controllers\Sadmin;

use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Models\Partner;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PartnerAPIController extends AppBaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $partners = Partner::all()->map(function ($partner) {
            return [
                'id' => $partner->id,
                'name' => $partner->name,
                'image' => $partner->image,
            ];
        });
        return $this->sendResponse($partners, 'Service Retrieved Successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);


        try {
            DB::beginTransaction();
            $partner = Partner::create([
                'name' => $validated['name'],
            ]);
            $partner->addMedia($validated['image'])->toMediaCollection(Partner::IMAGE, config('app.media_disc'));

            DB::commit();

            return $this->sendSuccess(__('messages.success.partner_created'));
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
    public function update(Request $request, Partner $partner)
    {
        $validated = $request->validate([
            'name' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);


        try {
            DB::beginTransaction();
            $partner->update([
                'name' => $validated['name'],
            ]);
            if (isset($validated['image']) && !empty($validated['image'])) {
                $partner->clearMediaCollection(Partner::IMAGE);
                $partner->addMedia($validated['image'])->toMediaCollection(Partner::IMAGE, config('app.media_disc'));
            }

            DB::commit();

            return $this->sendSuccess(__('messages.success.partner_updated'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Partner $partner)
    {

        try {
            DB::beginTransaction();
            $partner->delete();
            DB::commit();

            return $this->sendSuccess(__('messages.success.partner_deleted'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }
}
