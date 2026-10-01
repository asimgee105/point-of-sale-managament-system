<?php

namespace App\Http\Controllers\Sadmin;

use Illuminate\Http\Request;
use App\Http\Controllers\AppBaseController;
use App\Http\Resources\FaqCollection;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Repositories\FaqRepository;
use Exception;
use Illuminate\Support\Facades\DB;

class FaqAPIController extends AppBaseController
{
    /** @var FaqRepository */
    private $faqRepository;

    public function __construct(FaqRepository $faqRepository)
    {
        $this->faqRepository = $faqRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): FaqCollection
    {
        $perPage = getPageSize($request);
        $faqs = $this->faqRepository->paginate($perPage);
        FaqResource::usingWithCollection();

        return new FaqCollection($faqs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
        ]);


        try {
            DB::beginTransaction();

            Faq::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
            ]);

            DB::commit();

            return $this->sendSuccess(__('messages.success.faq_created'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Faq $faq)
    {
        return new FaqResource($faq);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Faq $faq)
    {
        $validated = $request->validate([
            'title' => 'required',
            'description' => 'required',
        ]);


        try {
            DB::beginTransaction();

            $faq->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
            ]);

            DB::commit();

            return $this->sendSuccess(__('messages.success.faq_updated'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }

    /**
     * Remove the specified resource(s) from storage.
     */
    public function destroy(Request $request)
    {
        $ids = $request->id;

        if (!is_array($ids)) {
            return $this->sendError('Invalid request format.');
        }

        try {
            DB::beginTransaction();

            foreach ($ids as $id) {
                $faq = Faq::find($id);
                if ($faq) {
                    $faq->delete();
                }
            }

            DB::commit();

            return $this->sendSuccess(__('messages.success.faq_deleted'));
        } catch (Exception $exception) {
            DB::rollBack();
            return $this->sendError($exception->getMessage());
        }
    }
}
