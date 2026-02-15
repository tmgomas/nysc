<?php

namespace App\DTOs;

class MemberRegistrationData
{
    public function __construct(
        public readonly string $nicPassport,
        public readonly string $dateOfBirth,
        public readonly string $gender,
        public readonly string $contactNumber,
        public readonly string $address,
        public readonly string $emergencyContact,
        public readonly string $emergencyNumber,
        public readonly array $programIds,
        public readonly ?string $photoUrl = null,
    ) {}

    /**
     * Create from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            nicPassport: $data['nic_passport'],
            dateOfBirth: $data['date_of_birth'],
            gender: $data['gender'],
            contactNumber: $data['contact_number'],
            address: $data['address'],
            emergencyContact: $data['emergency_contact'],
            emergencyNumber: $data['emergency_number'],
            sportIds: $data['program_ids'] ?? [],
            photoUrl: $data['photo_url'] ?? null,
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'nic_passport' => $this->nicPassport,
            'date_of_birth' => $this->dateOfBirth,
            'gender' => $this->gender,
            'contact_number' => $this->contactNumber,
            'address' => $this->address,
            'emergency_contact' => $this->emergencyContact,
            'emergency_number' => $this->emergencyNumber,
            'program_ids' => $this->sportIds,
            'photo_url' => $this->photoUrl,
        ];
    }
}
