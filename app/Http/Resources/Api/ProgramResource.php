<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'short_code' => $this->short_code,
            'description' => $this->description,
            'monthly_fee' => $this->monthly_fee,
            'admission_fee' => $this->admission_fee,
            'schedule' => $this->schedule,
            'schedule_type' => $this->schedule_type,
            'is_active' => $this->is_active,
            'location' => $this->whenLoaded('location', function () {
                return [
                    'id' => $this->location->id,
                    'name' => $this->location->name,
                ];
            }),
        ];
    }
}
