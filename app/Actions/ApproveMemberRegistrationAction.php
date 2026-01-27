<?php

namespace App\Actions;

use App\Models\Member;
use App\Enums\MemberStatus;
use Illuminate\Support\Facades\Auth;

class ApproveMemberRegistrationAction
{
    /**
     * Approve a pending member registration
     */
    public function execute(Member $member): Member
    {
        if ($member->status !== MemberStatus::PENDING) {
            throw new \Exception('Only pending members can be approved');
        }

        $member->update([
            'status' => MemberStatus::ACTIVE,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        // Log the approval
        $member->log('approved', 'Member registration approved by ' . Auth::user()->name);

        return $member->fresh();
    }

    /**
     * Reject a pending member registration
     */
    public function reject(Member $member, string $reason = null): Member
    {
        if ($member->status !== MemberStatus::PENDING) {
            throw new \Exception('Only pending members can be rejected');
        }

        $member->update([
            'status' => MemberStatus::INACTIVE,
        ]);

        // Log the rejection
        $description = 'Member registration rejected by ' . Auth::user()->name;
        if ($reason) {
            $description .= '. Reason: ' . $reason;
        }
        
        $member->log('rejected', $description);

        return $member->fresh();
    }
}
