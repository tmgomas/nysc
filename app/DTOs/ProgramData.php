<?php

namespace App\DTOs;

class ProgramData
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $description = null,
        public readonly float $admissionFee = 0,
        public readonly float $monthlyFee = 0,
        public readonly ?int $capacity = null,
        public readonly ?string $location = null,
        public readonly ?array $schedule = null,
        public readonly bool $isActive = true,
    ) {}

    /**
     * Create from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            description: $data['description'] ?? null,
            admissionFee: (float) ($data['admission_fee'] ?? 0),
            monthlyFee: (float) ($data['monthly_fee'] ?? 0),
            capacity: $data['capacity'] ?? null,
            location: $data['location'] ?? null,
            schedule: $data['schedule'] ?? null,
            isActive: $data['is_active'] ?? true,
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'admission_fee' => $this->admissionFee,
            'monthly_fee' => $this->monthlyFee,
            'capacity' => $this->capacity,
            'location' => $this->location,
            'schedule' => $this->schedule,
            'is_active' => $this->isActive,
        ];
    }
}
