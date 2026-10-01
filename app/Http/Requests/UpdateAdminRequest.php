<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateAdminRequest
 */
class UpdateAdminRequest extends FormRequest
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
        $rules = User::$rules;
        $rules['email'] = 'required|email|unique:users,email,' . (int) $this->route('admin_user');
        $rules['phone'] = 'required|numeric|unique:users,phone,' . (int) $this->route('admin_user');
        $rules['password'] = 'nullable';
        $rules['confirm_password'] = 'nullable';

        return $rules;
    }
}
