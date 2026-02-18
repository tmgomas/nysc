<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_number' => $this->member_number,
            'full_name' => $this->full_name,
            'calling_name' => $this->calling_name,
            'email' => $this->email,
            'contact_number' => $this->contact_number,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'gender' => $this->gender,
            'address' => $this->address,
            'photo_url' => $this->photo_url,
            'blood_group' => $this->blood_group,
            'jersey_size' => $this->jersey_size,
            'status' => $this->status,
            'membership_type' => $this->membership_type,
            'registration_date' => $this->registration_date?->format('Y-m-d'),
            'programs' => ProgramResource::collection($this->whenLoaded('programs')),
        ];
    }
}
