<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMainProductRequest extends FormRequest
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
        // if (request()->get('product_type') == 1) {
        //     $rules = Product::$rules;
        //     $rules['code'] = 'required|unique:main_products,code,' . $this->route('product');
        //     $rules['product_code'] = 'required';
        //     return $rules;
        // }

        // if (request()->get('product_type') == 2) {
        // $variationData = json_decode(request()->get('variation_data'), true);
        // $this->merge([
        //     'variation_data' => $variationData,
        // ]);

        return [
            'name' => 'required',
            'product_code' => 'required',
            'product_category_id' => 'required|exists:product_categories,id',
            'brand_id' => 'required|exists:brands,id',
            // 'product_cost' => 'required|numeric', //
            // 'product_price' => 'required|numeric', //
            'product_unit' => 'required',
            'sale_unit' => 'nullable',
            'purchase_unit' => 'nullable',
            // 'stock_alert' => 'nullable', //
            'quantity_limit' => 'nullable',
            // 'order_tax' => 'nullable|numeric', //
            // 'tax_type' => 'nullable', //
            'notes' => 'nullable',
            'barcode_symbol' => 'required',
            'images.*' => 'image|mimes:jpg,jpeg,png,svg',
            // 'variation_data.*.product_cost' => 'required|numeric',
            // 'variation_data.*.product_price' => 'required|numeric',
            // 'variation_data.*.stock_alert' => 'nullable',
            // 'variation_data.*.order_tax' => 'nullable|numeric',
            // 'variation_data.*.tax_type' => 'nullable',
        ];
        // }

        // return Product::$rules;
    }

    public function messages(): array
    {
        return [
            'code.unique' => __('messages.error.code_taken'),
            'images.*.max' => __('messages.error.images_max_size'),
            'images.*.image' => __('messages.error.invalid_image'),
            'images.*.mimes' => __('messages.error.allowed_image_types'),
            'images.*' => __('messages.error.images_max_size'),
        ];
    }
}
