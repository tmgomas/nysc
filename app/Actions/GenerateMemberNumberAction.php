<?php

namespace App\Actions;

use App\Models\Member;
use App\Models\Setting;

class GenerateMemberNumberAction
{
    /**
     * Generate the next available member number
     * Format: {PREFIX}{NUMBER} (e.g., SC0001, M0001)
     * Configurable via settings
     */
    public function execute(): string
    {
        // Get settings
        $prefix = Setting::get('member_number_prefix', 'SC');
        $digits = Setting::get('member_number_digits', 4);
        $startNumber = Setting::get('member_number_start', 1);

        $lastMember = Member::withTrashed()
            ->latest('created_at')
            ->first();

        if (!$lastMember) {
            return $prefix . str_pad($startNumber, $digits, '0', STR_PAD_LEFT);
        }

        // Extract number from last member number (e.g., "SC0001" -> 1)
        $prefixLength = strlen($prefix);
        $lastNumber = (int) substr($lastMember->member_number, $prefixLength);
        $nextNumber = $lastNumber + 1;

        return $prefix . str_pad($nextNumber, $digits, '0', STR_PAD_LEFT);
    }
}
