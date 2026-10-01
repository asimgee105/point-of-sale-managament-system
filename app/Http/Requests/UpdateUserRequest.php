<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateUserRequest
 */
class UpdateUserRequest extends FormRequest
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
        $rules['email'] = 'required|email|unique:users,email,' . $this->route('user');
        $rules['phone'] = 'required|numeric|unique:users,phone,' . $this->route('user');
        $rules['role_id'] = 'integer|exists:roles,id';
        $adminRole = Role::withoutGlobalScope('tenant')->where('name', Role::ADMIN)->first();
        if($this->role_id == $adminRole->id){
            $rules['stores'] = ['required'];
            $rules['warehouse'] = ['required'];
        }
        $rules['password'] = 'nullable';
        $rules['confirm_password'] = 'nullable';

        return $rules;
    }
}
