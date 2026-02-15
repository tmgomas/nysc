<?php

namespace App\DTOs;

use App\Enums\AttendanceMethod;
use Carbon\Carbon;

class AttendanceData
{
    public function __construct(
        public readonly string $memberId,
        public readonly string $programId,
        public readonly AttendanceMethod $method,
        public readonly ?Carbon $checkInTime = null,
        public readonly ?string $notes = null,
    ) {}

    /**
     * Create from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            memberId: $data['member_id'],
            sportId: $data['program_id'],
            method: AttendanceMethod::from($data['method']),
            checkInTime: isset($data['check_in_time']) ? Carbon::parse($data['check_in_time']) : null,
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
            'program_id' => $this->sportId,
            'method' => $this->method->value,
            'check_in_time' => $this->checkInTime?->toDateTimeString(),
            'notes' => $this->notes,
        ];
    }
}
