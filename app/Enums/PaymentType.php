<?php

namespace App\Enums;

enum PaymentType: string
{
    case ADMISSION = 'admission';
    case MONTHLY = 'monthly';
    case BULK = 'bulk';

    public function label(): string
    {
        return match($this) {
            self::ADMISSION => 'Admission Fee',
            self::MONTHLY => 'Monthly Fee',
            self::BULK => 'Bulk Payment',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::ADMISSION => 'One-time admission fee',
            self::MONTHLY => 'Monthly membership fee',
            self::BULK => 'Advance payment for multiple months',
        };
    }
}
