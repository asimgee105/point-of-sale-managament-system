<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class CreateUserRequest
 */
class CreateUserRequest extends FormRequest
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
        $rules['role_id'] = 'exists:roles,id';
        $adminRole = Role::withoutGlobalScope('tenant')->where('name', Role::ADMIN)->first();
        if($this->role_id == $adminRole->id){
            $rules['stores'] = ['required'];
            $rules['warehouse'] = ['required'];
        }

        return $rules;
    }
}
