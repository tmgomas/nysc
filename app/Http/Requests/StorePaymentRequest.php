<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\ValidPaymentAmount;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('create_payments');
    }

    public function rules(): array
    {
        return [
            'member_id' => 'required|exists:members,id',
            'type' => 'required|in:admission,monthly,bulk',
            'payment_method' => 'required|in:cash,bank_transfer,online',
            'amount' => ['required', 'numeric', 'min:0', new ValidPaymentAmount()],
            'month_year' => 'required_if:type,monthly,bulk|nullable|date_format:Y-m',
            'months_count' => 'required_if:type,bulk|nullable|integer|min:1|max:12',
            'receipt_url' => 'nullable|url',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'member_id.exists' => 'Selected member does not exist.',
            'month_year.required_if' => 'Month/Year is required for monthly and bulk payments.',
            'months_count.required_if' => 'Number of months is required for bulk payments.',
            'months_count.max' => 'Maximum 12 months allowed for bulk payment.',
        ];
    }
}
