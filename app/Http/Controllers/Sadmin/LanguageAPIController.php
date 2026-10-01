<?php

namespace App\Http\Controllers\Sadmin;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateLanguageRequest;
use App\Http\Requests\UpdateLanguageRequest;
use App\Http\Resources\LanguageCollection;
use App\Http\Resources\LanguageResource;
use App\Models\Language;
use App\Models\User;
use App\Repositories\LanguageRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class LanguageAPIController extends AppBaseController
{
    /** @var languageRepository */
    private $languageRepository;

    public function __construct(LanguageRepository $languageRepository)
    {
        $this->languageRepository = $languageRepository;
    }

    public function index(Request $request): LanguageCollection
    {
        $perPage = getPageSize($request);
        if (Language::where('is_default', 1)->count() > 1) {
            Language::whereNot('iso_code', 'en')->update(['is_default' => 0]);
        }

        $languages = $this->languageRepository;

        $languages = $languages->paginate($perPage);

        LanguageResource::usingWithCollection();

        return new LanguageCollection($languages);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    public function store(CreateLanguageRequest $request): LanguageResource
    {

        $input = $request->all();

        $language = $this->languageRepository->storeLanguage($input);

        return new LanguageResource($language);
    }

    public function show(Language $language): LanguageResource
    {
        return new LanguageResource($language);
    }

    public function edit(Language $language): LanguageResource
    {
        return new LanguageResource($language);
    }

    public function update(UpdateLanguageRequest $request, Language $language)
    {
        if ($language->is_default == true) {
            return $this->sendError(__('messages.error.default_language_cant_change'));
        }

        $input = $request->all();

        // Check if trying to disable a language that's in use
        if (isset($input['status']) && !$input['status'] && $language->isInUse()) {
            return $this->sendError(__('messages.error.language_in_use_cant_disable'));
        }

        $language = $this->languageRepository->updateLanguage($input, $language);

        return new LanguageResource($language);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Language $language)
    {
        try {

            DB::beginTransaction();

            if ($language->is_default == true) {
                return $this->sendError(__('messages.error.default_language_cant_delete'));
            }

            $usesLang = User::withoutGlobalScope('tenant')->pluck('language')->toArray();
            if (in_array($language->iso_code, $usesLang)) {
                return $this->sendError(__('messages.error.uses_language_cant_delete'));
            }

            // json file delete
            $path = resource_path('pos/src/locales/' . $language->iso_code . '.json');
            if (File::exists($path)) {
                File::delete($path);
            }

            // php directory delete
            $directoryPath = base_path('lang/') . $language->iso_code;
            if (File::exists($directoryPath)) {
                File::deleteDirectory($directoryPath);
            }

            $language->delete();

            DB::commit();

            return $this->sendSuccess('Language Deleted successfully');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function showTranslation(Language $language)
    {
        $selectedLang = $language->iso_code;
        $langExists = $this->languageRepository->checkLanguageExistOrNot($selectedLang);
        if (! $langExists) {
            throw new UnprocessableEntityHttpException($selectedLang . ' language file not found.');
        }

        $data['id'] = $language->id;
        $data['iso_code'] = $language->iso_code;
        $data['lang_json_array'] = $this->languageRepository->getFileData($selectedLang);
        $data['lang_php_array'] = $this->languageRepository->getPhpFileData($selectedLang);

        return $this->sendResponse($data, 'Language retrieved successfully');
    }

    /**
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function updateTranslation(Language $language, Request $request)
    {

        try {
            $isoCode = $language->iso_code;

            if (! empty($request->get('lang_json_array'))) {
                $fileExists = $this->languageRepository->checkLanguageExistOrNot($isoCode);

                if (! $fileExists) {
                    return $this->sendError('Json File not found.');
                }

                if (! empty($isoCode)) {
                    $langJson = json_encode($request->lang_json_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

                    File::put(resource_path('pos/src/locales/') . $isoCode . '.json', $langJson);
                }
            }

            if (! empty($request->get('lang_php_array'))) {
                $fileExists = $this->languageRepository->checkPhpDirectoryExistOrNot($isoCode);

                if (! $fileExists) {
                    return $this->sendError('Directory not found.');
                }

                if (! empty($isoCode)) {
                    $result = $request->get('lang_php_array');
                    File::put(base_path('lang/') . $isoCode . '/messages.php', '<?php return ' . var_export($result, true) . '?>');
                }
            }

            return $this->sendSuccess('Language updated successfully');
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * Toggle language status
     *
     * @param Language $language
     * @return LanguageResource|\Illuminate\Http\JsonResponse
     */
    public function toggleStatus(Language $language)
    {
        try {
            $language = $this->languageRepository->toggleStatus($language);

            return new LanguageResource($language);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }
    public function toggleDefault(Language $language)
    {
        try {
            $language = $this->languageRepository->toggleDefaultLanguage($language);

            return new LanguageResource($language);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }
}
