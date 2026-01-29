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

        // Get all enrolled sports
        $enrolledSports = $member->sports;
        
        if ($enrolledSports->isEmpty()) {
            throw new \Exception('Member must have at least one sport enrolled to be approved.');
        }

        // Generate sport-specific references for all enrolled sports
        $registrationReferenceGenerator = new GenerateRegistrationReferenceAction();
        $sportReferences = [];

        foreach ($enrolledSports as $sport) {
            $sportReference = $registrationReferenceGenerator->execute(
                $sport->id, 
                $member->registration_date
            );
            
            // Update the member_sport pivot with the sport reference
            $member->sports()->updateExistingPivot($sport->id, [
                'sport_reference' => $sportReference
            ]);
            
            $sportReferences[] = "{$sport->name}: {$sportReference}";
        }

        // Use first sport reference as primary registration reference
        $primaryReference = $member->sports()->first()->pivot->sport_reference;

        $member->update([
            'status' => MemberStatus::ACTIVE,
            'registration_reference' => $primaryReference,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        // Log the approval with all sport references
        $referencesText = implode(', ', $sportReferences);
        $member->log('approved', 'Member registration approved by ' . Auth::user()->name . '. Sport References: ' . $referencesText);

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
