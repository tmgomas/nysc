<?php

namespace App\DTOs;

use App\Enums\{PaymentType, PaymentMethod};

class PaymentData
{
    public function __construct(
        public readonly string $memberId,
        public readonly PaymentType $type,
        public readonly float $amount,
        public readonly PaymentMethod $paymentMethod,
        public readonly ?string $monthYear = null,
        public readonly int $monthsCount = 1,
        public readonly ?string $receiptUrl = null,
        public readonly ?string $referenceNumber = null,
        public readonly ?string $notes = null,
    ) {}

    /**
     * Create from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            memberId: $data['member_id'],
            type: PaymentType::from($data['type']),
            amount: (float) $data['amount'],
            paymentMethod: PaymentMethod::from($data['payment_method']),
            monthYear: $data['month_year'] ?? null,
            monthsCount: $data['months_count'] ?? 1,
            receiptUrl: $data['receipt_url'] ?? null,
            referenceNumber: $data['reference_number'] ?? null,
            notes: $data['notes'] ?? null,
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'member_id' => $this->memberId,
            'type' => $this->type->value,
            'amount' => $this->amount,
            'payment_method' => $this->paymentMethod->value,
            'month_year' => $this->monthYear,
            'months_count' => $this->monthsCount,
            'receipt_url' => $this->receiptUrl,
            'reference_number' => $this->referenceNumber,
            'notes' => $this->notes,
        ];
    }
}
