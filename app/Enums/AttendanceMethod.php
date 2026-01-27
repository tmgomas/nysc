<?php

namespace App\Enums;

enum AttendanceMethod: string
{
    case QR_CODE = 'qr_code';
    case MANUAL = 'manual';
    case BULK = 'bulk';

    public function label(): string
    {
        return match($this) {
            self::QR_CODE => 'QR Code Scan',
            self::MANUAL => 'Manual Entry',
            self::BULK => 'Bulk Import',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::QR_CODE => 'qrcode',
            self::MANUAL => 'edit',
            self::BULK => 'upload',
        };
    }
}
