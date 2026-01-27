<?php

namespace App\Enums;

enum MemberStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case INACTIVE = 'inactive';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending Approval',
            self::ACTIVE => 'Active',
            self::SUSPENDED => 'Suspended',
            self::INACTIVE => 'Inactive',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'yellow',
            self::ACTIVE => 'green',
            self::SUSPENDED => 'red',
            self::INACTIVE => 'gray',
        };
    }
}
