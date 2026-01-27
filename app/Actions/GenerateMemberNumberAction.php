<?php

namespace App\Actions;

use App\Models\Member;

class GenerateMemberNumberAction
{
    /**
     * Generate the next available member number
     * Format: M0001, M0002, M0003, etc.
     */
    public function execute(): string
    {
        $lastMember = Member::withTrashed()
            ->latest('created_at')
            ->first();

        if (!$lastMember) {
            return 'M0001';
        }

        // Extract number from last member number (e.g., "M0001" -> 1)
        $lastNumber = (int) substr($lastMember->member_number, 1);
        $nextNumber = $lastNumber + 1;

        return 'M' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
