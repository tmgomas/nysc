<?php

namespace App\Enums;

enum AttendanceMethod: string
{
    case QR_CODE = 'qr_code';
    case NFC = 'nfc';
    case RFID = 'rfid';
    case MANUAL = 'manual';
    case BULK = 'bulk';

    public function label(): string
    {
        return match($this) {
            self::QR_CODE => 'QR Code Scan',
            self::NFC => 'NFC Tag Scan',
            self::RFID => 'RFID Card Scan',
            self::MANUAL => 'Manual Entry',
            self::BULK => 'Bulk Import',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::QR_CODE => 'qrcode',
            self::NFC => 'nfc',
            self::RFID => 'credit-card',
            self::MANUAL => 'edit',
            self::BULK => 'upload',
        };
    }
}
