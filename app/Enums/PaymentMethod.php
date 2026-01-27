<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'cash';
    case BANK_TRANSFER = 'bank_transfer';
    case ONLINE = 'online';

    public function label(): string
    {
        return match($this) {
            self::CASH => 'Cash',
            self::BANK_TRANSFER => 'Bank Transfer',
            self::ONLINE => 'Online Payment',
        };
    }
}
