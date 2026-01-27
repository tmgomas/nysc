<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarkAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('mark_attendance');
    }

    public function rules(): array
    {
        return [
            'member_id' => 'required|exists:members,id',
            'sport_id' => 'required|exists:sports,id',
            'method' => 'required|in:qr_code,manual,bulk',
            'check_in_time' => 'nullable|date|before_or_equal:now',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'member_id.exists' => 'Selected member does not exist.',
            'sport_id.exists' => 'Selected sport does not exist.',
            'check_in_time.before_or_equal' => 'Check-in time cannot be in the future.',
        ];
    }
}
