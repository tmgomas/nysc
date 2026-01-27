<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case VERIFIED = 'verified';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::PAID => 'Paid',
            self::VERIFIED => 'Verified',
            self::REJECTED => 'Rejected',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'yellow',
            self::PAID => 'blue',
            self::VERIFIED => 'green',
            self::REJECTED => 'red',
        };
    }
}
