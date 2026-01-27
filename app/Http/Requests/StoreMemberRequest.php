<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\ValidNicNumber;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('create_members');
    }

    public function rules(): array
    {
        return [
            'nic_passport' => ['required', 'string', 'unique:members', new ValidNicNumber()],
            'date_of_birth' => 'required|date|before:today|after:1900-01-01',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'required|string|regex:/^[0-9]{10}$/',
            'address' => 'required|string|max:500',
            'emergency_contact' => 'required|string|max:255',
            'emergency_number' => 'required|string|regex:/^[0-9]{10}$/',
            'sport_ids' => 'required|array|min:1',
            'sport_ids.*' => 'exists:sports,id',
            'photo_url' => 'nullable|url',
        ];
    }

    public function messages(): array
    {
        return [
            'nic_passport.unique' => 'This NIC/Passport number is already registered.',
            'contact_number.regex' => 'Contact number must be 10 digits.',
            'emergency_number.regex' => 'Emergency number must be 10 digits.',
            'sport_ids.required' => 'Please select at least one sport.',
        ];
    }
}
