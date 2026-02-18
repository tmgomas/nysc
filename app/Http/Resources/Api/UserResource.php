<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->getRoleNames(),
            'member' => $this->whenLoaded('member', function () {
                return new MemberResource($this->member);
            }),
            'coach' => $this->whenLoaded('coach', function () {
                return [
                    'id' => $this->coach->id,
                    'programs' => ProgramResource::collection($this->coach->programs ?? collect()),
                ];
            }),
        ];
    }
}
