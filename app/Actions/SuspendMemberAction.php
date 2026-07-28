<?php

namespace App\Actions;

use App\Enums\MemberStatus;
use App\Models\Member;
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

        $userName = Auth::check() ? Auth::user()->name : 'System';

        // Log the suspension
        $member->log('suspended', 'Member suspended by '.$userName.". Reason: {$reason}", [
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

        $userName = Auth::check() ? Auth::user()->name : 'System';

        // Log the reactivation
        $member->log('reactivated', 'Member reactivated by '.$userName);

        return $member->fresh();
    }
}
