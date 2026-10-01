<?php

namespace App\Repositories;

use App\Models\Language;
use App\Models\User;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class LanguageRepository
 */
class LanguageRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'iso_code',
        'status',
        'created_at',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'name',
        'iso_code',
        'status',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model(): string
    {
        return Language::class;
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     *
     * @throws \Prettus\Validator\Exceptions\ValidatorException
     */
    public function storeLanguage($input)
    {
        try {

            DB::beginTransaction();

            $input['iso_code'] = Str::lower($input['iso_code']);

            $allLanguagesArr = [];
            $languages = File::files(resource_path('pos/src/locales'));
            foreach ($languages as $language) {
                if ($language->getFilename() != 'index.js') {
                    $allLanguagesArr[] = substr($language, -7, -5);
                }
            }

            if (in_array($input['iso_code'], $allLanguagesArr)) {
                throw new UnprocessableEntityHttpException($input['iso_code'] . 'json file already exists');
            }

            $phpLanguages = File::directories(base_path('lang'));
            foreach ($phpLanguages as $language) {
                $allPhpLanguagesArr[] = substr($language, -2);
            }

            if (in_array($input['iso_code'], $allPhpLanguagesArr)) {
                throw new UnprocessableEntityHttpException($input['iso_code'] . 'directory exist');
            }

            $language = $this->create($input);
            $translation = $this->translationFileCreate($language);

            DB::commit();

            return $language;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function translationFileCreate($input): bool
    {
        try {

            if (! empty($input['iso_code'])) {
                // json lang file create
                File::copy(
                    resource_path('pos/src/locales/en.json'),
                    resource_path('pos/src/locales/' . $input['iso_code'] . '.json')
                );

                // php lang directory and file create
                File::makeDirectory(base_path('lang') . '/' . $input['iso_code']);
                File::copy(App::langPath() . '/en/messages.php', App::langPath() . '/' . $input['iso_code'] . '/messages.php');
            }

            return true;
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function updateLanguage($input, $language)
    {
        try {

            DB::beginTransaction();

            $oldLang = $language->iso_code;
            $input['iso_code'] = Str::lower($input['iso_code']);

            $language->update($input);

            $users = User::where('language', $oldLang)->get();
            foreach ($users as $user) {
                $user->update([
                    'language' => $input['iso_code'],
                ]);
            }

            $ifChange = $language->iso_code != $oldLang;

            if ($ifChange) {
                // json file check exist or not
                $ifExist = $this->checkLanguageExistOrNot($language->iso_code);
                if ($ifExist) {
                    throw new UnprocessableEntityHttpException($language->iso_code . __('file already exists'));
                }
                // Php directory check exist or not
                $ifDirectoryExist = $this->checkPhpDirectoryExistOrNot($language->iso_code);
                if ($ifDirectoryExist) {
                    throw new UnprocessableEntityHttpException($language->iso_code . __('directory already exists'));
                }

                // change json file name
                File::move(resource_path('pos/src/locales/' . $oldLang . '.json'), resource_path('pos/src/locales/' . $language->iso_code . '.json'));

                // change php directory name
                File::move(App::langPath() . '/' . $oldLang . '/', App::langPath() . '/' . $language->iso_code);
            }

            DB::commit();

            return $language;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function checkLanguageExistOrNot($selectedLang): bool
    {
        $langExists = true;
        $allLanguagesArr = [];
        try {

            $languages = File::files(resource_path('pos/src/locales'));

            foreach ($languages as $language) {
                if ($language->getFilename() != 'index.js') {
                    $allLanguagesArr[] = substr($language, -7, -5);
                }
            }

            if (! in_array($selectedLang, $allLanguagesArr)) {
                $langExists = false;
            }

            return $langExists;
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function checkPhpDirectoryExistOrNot($selectedLang): bool
    {
        $langExists = true;
        $allLanguagesArr = [];
        try {

            $phpLanguages = File::directories(base_path('lang'));
            foreach ($phpLanguages as $language) {
                $allPhpLanguagesArr[] = substr($language, -2);
            }

            if (! in_array($selectedLang, $allPhpLanguagesArr)) {
                $langExists = false;
            }

            return $langExists;
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return mixed
     */
    public function getFileData($selectedLang)
    {
        try {

            $languages = File::files(resource_path('pos/src/locales'));

            foreach ($languages as $language) {
                if ($language->getFilename() != 'index.js') {
                    $isoCode = substr($language, -7, -5);
                    if ($isoCode == $selectedLang) {
                        $data = json_decode(file_get_contents($language), true);
                    }
                }
            }

            return $data;
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return array|\Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\Translation\Translator|\Illuminate\Http\RedirectResponse|string|null
     */
    public function getPhpFileData($selectedLang)
    {
        $fileExists = $this->checkPhpDirectoryExistOrNot($selectedLang);
        if (! $fileExists) {
            throw new UnprocessableEntityHttpException($selectedLang . ' Directory not found.');
        }

        try {
            $data = trans(pathinfo(App::langPath() . '/' . $selectedLang . '/messages.php', PATHINFO_FILENAME));

            return $data;
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * Toggle language status
     *
     * @param Language $language
     * @return Language
     * @throws UnprocessableEntityHttpException
     */
    public function toggleStatus(Language $language): Language
    {
        try {
            // Check if the status column exists before proceeding
            if (!Schema::hasColumn('languages', 'status')) {
                throw new UnprocessableEntityHttpException(__('messages.error.status_column_not_available'));
            }

            // Check if language is in use and trying to disable it
            if ($language->status && $language->isInUse()) {
                throw new UnprocessableEntityHttpException(__('messages.error.language_in_use_cant_disable'));
            }

            // Check if it's the default language and trying to disable it
            if ($language->is_default && $language->status) {
                throw new UnprocessableEntityHttpException(__('messages.error.default_language_cant_disable'));
            }

            $language->status = !$language->status;
            $language->save();

            return $language;
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    public function toggleDefaultLanguage(Language $language): Language
    {
        try {
            // Check if the 'is_default' column exists
            if (!Schema::hasColumn('languages', 'is_default')) {
                throw new UnprocessableEntityHttpException(__('messages.error.status_column_not_available'));
            }

            DB::transaction(function () use ($language) {
                // Set all other languages to false
                Language::where('id', '!=', $language->id)
                    ->update(['is_default' => false]);

                // Toggle the selected language
                $language->is_default = true; // Make it default
                $language->save();
            });

            return $language;

        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
