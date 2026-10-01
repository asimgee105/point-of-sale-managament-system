<?php

namespace App\Http\Requests;

use App\Models\Taxes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateTaxRequest extends FormRequest
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
        $rules = Taxes::rules();
        // 'name' => 'required|unique:taxes,name,NULL,id,tenant_id,' . Auth::user()->tenant_id,

        $rules['name'] = 'required|unique:taxes,name,' . $this->route('tax') . ',id,tenant_id,' . Auth::user()->tenant_id;

        return $rules;
    }
}
