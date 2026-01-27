<?php

namespace App\Enums;

enum ScheduleStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case OVERDUE = 'overdue';
    case WAIVED = 'waived';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::PAID => 'Paid',
            self::OVERDUE => 'Overdue',
            self::WAIVED => 'Waived',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'yellow',
            self::PAID => 'green',
            self::OVERDUE => 'red',
            self::WAIVED => 'gray',
        };
    }
}
