<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'current_password' => 'required ',
            'new_password' => 'required|min:6|same:confirm_password',
            'confirm_password' => 'required|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'new_password.same' => __('messages.error.password_confirm_password_same'),
            'new_password.min' => __('messages.error.password_length'),
            'confirm_password.min' => __('messages.error.password_length'),
        ];
    }
}
