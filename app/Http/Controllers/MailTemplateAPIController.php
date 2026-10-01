<?php

namespace App\Http\Controllers;

use App\Http\Requests\MailTemplateUpdateRequest;
use App\Http\Resources\MailCollection;
use App\Http\Resources\MailResource;
use App\Models\MailTemplate;
use App\Models\Setting;
use App\Repositories\MailRepository;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class MailTemplateAPIController extends AppBaseController
{
    /** @var mailRepository */
    private $mailRepository;

    public function __construct(MailRepository $mailRepository)
    {
        $this->mailRepository = $mailRepository;
    }

    public function index(Request $request): MailCollection
    {
        $perPage = getPageSize($request);

        $mailTemplates = $this->mailRepository;

        $mailTemplates = $mailTemplates->paginate($perPage);

        MailResource::usingWithCollection();

        return new MailCollection($mailTemplates);
    }

    public function edit(MailTemplate $mailTemplate): MailResource
    {
        return new MailResource($mailTemplate);
    }

    public function update(MailTemplateUpdateRequest $request, $id): MailResource
    {
        $input = $request->all();

        $mailTemplate = $this->mailRepository->updateMailTemplate($input, $id);

        return new MailResource($mailTemplate);
    }

    public function changeActiveStatus($id): MailResource
    {
        $mailTemplate = MailTemplate::findOrFail($id);
        $status = ! $mailTemplate->status;
        $mailTemplate->update(['status' => $status]);

        return new MailResource($mailTemplate);
    }

    public function getEmailConfiguration(): JsonResponse
    {
        $settings = [
            'mail_mailer',
            'mail_host',
            'mail_port',
            'mail_username',
            'mail_password',
            'mail_from_address',
            'mail_encryption',
        ];

        $data = Setting::whereIn('key', $settings)->get();

        return $this->sendResponse($data, 'Mail Setting data retrieved successfully.');
    }
    public function emailConfiguration(Request $request): JsonResponse
    {
        $request->validate([
            'mail_mailer' => 'required',
            'mail_host' => 'required',
            'mail_port' => 'required',
            'mail_username' => 'required',
            'mail_password' => 'required',
            'mail_from_address' => 'required',
            'mail_encryption' => 'required',
        ]);
        $input = $request->all();
        $this->mailRepository->updateMailSettings($input);

        return $this->sendSuccess('Mail Settings Save Successfully');
    }
}
