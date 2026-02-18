<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'amount' => $this->amount,
            'month_year' => $this->month_year,
            'status' => $this->status,
            'due_date' => $this->due_date?->format('Y-m-d'),
            'paid_date' => $this->paid_date?->format('Y-m-d'),
            'payment_method' => $this->payment_method,
            'reference_number' => $this->reference_number,
            'receipt_number' => $this->receipt_number,
            'is_overdue' => $this->is_overdue,
            'program' => new ProgramResource($this->whenLoaded('program')),
            'items' => PaymentItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
