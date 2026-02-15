<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('create_programs');
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:programs,name',
            'description' => 'nullable|string|max:1000',
            'admission_fee' => 'required|numeric|min:0',
            'monthly_fee' => 'required|numeric|min:0',
            'capacity' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:255',
            'schedule' => 'nullable|array',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A program with this name already exists.',
            'admission_fee.min' => 'Admission fee cannot be negative.',
            'monthly_fee.min' => 'Monthly fee cannot be negative.',
            'capacity.min' => 'Capacity must be at least 1.',
        ];
    }
}
