<?php

namespace App\Repositories;

use App\Models\MailTemplate;
use App\Models\Setting;
use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class SaleRepository
 */
class MailRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'template_name',
        'content',
    ];

    /**
     * @var string[]
     */
    protected $allowedFields = [
        'template_name',
        'content',
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
        return MailTemplate::class;
    }

    public function updateMailTemplate($input, $id)
    {
        $mailTemplate = MailTemplate::whereId($id)->firstOrFail();
        $mailTemplate->update([
            'content' => $input['content'],
        ]);

        return $mailTemplate;
    }

    public function updateMailSettings($input)
    {
        try {
            DB::beginTransaction();

            $settingInputArray = Arr::only($input, [
                'mail_mailer',
                'mail_host',
                'mail_port',
                'mail_username',
                'mail_password',
                'mail_from_address',
                'mail_encryption',
            ]);

            foreach ($settingInputArray as $key => $value) {
                $setting = Setting::where('key', '=', $key)->where('tenant_id', '=', getActiveStore()->tenant_id)->first();
                if ($setting) {
                    $setting->update(['value' => $value]);
                } else {
                    Setting::create([
                        'key' => $key,
                        'value' => $value,
                        'tenant_id' => getActiveStore()->tenant_id,
                    ]);
                }
            }

            DB::commit();

            return $input;
        } catch (Exception $exception) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($exception->getMessage());
        }
    }
}
