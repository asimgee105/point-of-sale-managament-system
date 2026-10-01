<?php

namespace App\Http\Requests;

use App\Models\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdatePaymentMethodRequest extends FormRequest
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
        $rules = PaymentMethod::rules();
        $rules['name'] = 'required|string|max:255|unique:payment_methods,name,' . $this->route('payment_method') . ',id,tenant_id,' . Auth::user()->tenant_id;

        return $rules;
    }
}
