<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        if (is_string($this->email)) {
            $this->merge(['email' => strtolower(trim($this->email))]);
        }
        if ($this->has('language_code')) {
            app()->setLocale($this->language_code);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email:rfc|max:255|unique:users',
            'password' => 'required|string|min:12|max:1024',
            'confirm_password' => 'required|string|same:password',
            'token' => 'nullable|string|max:4096',
        ];
    }

    public function messages(): array
    {
        $messages['email.unique'] = __('messages.error.email_taken');

        return $messages;
    }
}
