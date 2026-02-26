<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Api\ProgramResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $title = $this->type?->value ?? $this->type;
        $monthName = null;
        if ($this->month_year) {
            try {
                $date = \Carbon\Carbon::createFromFormat('Y-m', $this->month_year);
                $monthName = $date->format('F');
                $typeString = $this->type instanceof \BackedEnum ? $this->type->value : (string) $this->type;
                $title = $monthName . ' ' . ucfirst($typeString) . ' Fee';
            } catch (\Exception $e) {
                // Ignore parsing errors, keep original type
            }
        }

        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $title,
            'amount' => $this->amount,
            'month_year' => $this->month_year,
            'month_name' => $monthName,
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
