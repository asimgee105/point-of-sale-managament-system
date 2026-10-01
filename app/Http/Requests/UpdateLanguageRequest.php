<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLanguageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules['name'] = 'required|max:20|unique:languages,name,' . $this->route('language')->id;
        $rules['iso_code'] = 'required|max:2|min:2|unique:languages,iso_code,' . $this->route('language')->id;
        $rules['status'] = 'boolean';

        return $rules;
    }

    public function messages(): array
    {
        $messages['iso_code.required'] = 'The ISO Code field is required.';
        $messages['iso_code.unique'] = __('messages.error.iso_code_unique');

        return $messages;
    }
}
