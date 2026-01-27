<?php

namespace App\Actions;

use App\Models\Member;
use App\Enums\MemberStatus;
use Illuminate\Support\Facades\Auth;

class SuspendMemberAction
{
    /**
     * Suspend a member
     */
    public function execute(Member $member, string $reason): Member
    {
        if ($member->status === MemberStatus::SUSPENDED) {
            throw new \Exception('Member is already suspended');
        }

        $previousStatus = $member->status;

        $member->update([
            'status' => MemberStatus::SUSPENDED,
        ]);

        // Log the suspension
        $member->log('suspended', "Member suspended by " . Auth::user()->name . ". Reason: {$reason}", [
            'previous_status' => $previousStatus->value,
            'reason' => $reason,
        ]);

        return $member->fresh();
    }

    /**
     * Reactivate a suspended member
     */
    public function reactivate(Member $member): Member
    {
        if ($member->status !== MemberStatus::SUSPENDED) {
            throw new \Exception('Only suspended members can be reactivated');
        }

        $member->update([
            'status' => MemberStatus::ACTIVE,
        ]);

        // Log the reactivation
        $member->log('reactivated', "Member reactivated by " . Auth::user()->name);

        return $member->fresh();
    }
}
