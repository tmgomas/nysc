<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'check_in_time' => $this->check_in_time?->toIso8601String(),
            'check_out_time' => $this->check_out_time?->toIso8601String(),
            'duration_minutes' => $this->duration_minutes,
            'method' => $this->method,
            'notes' => $this->notes,
            'program' => new ProgramResource($this->whenLoaded('program')),
            'member' => new MemberResource($this->whenLoaded('member')),
        ];
    }
}
