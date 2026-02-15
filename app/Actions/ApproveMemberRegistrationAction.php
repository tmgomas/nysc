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
        $enrolledPrograms = $member->programs;
        
        if ($enrolledPrograms->isEmpty()) {
            throw new \Exception('Member must have at least one program enrolled to be approved.');
        }

        // Generate sport-specific references for all enrolled sports
        $registrationReferenceGenerator = new GenerateRegistrationReferenceAction();
        $programReferences = [];

        foreach ($enrolledPrograms as $program) {
            $programReference = $registrationReferenceGenerator->execute(
                $program->id, 
                $member->registration_date
            );
            
            // Update the member_sport pivot with the program reference
            $member->programs()->updateExistingPivot($program->id, [
                'program_reference' => $programReference
            ]);
            
            $programReferences[] = "{$program->name}: {$programReference}";
        }

        // Use first program reference as primary registration reference
        $primaryReference = $member->programs()->first()->pivot->program_reference;

        $member->update([
            'status' => MemberStatus::ACTIVE,
            'registration_reference' => $primaryReference,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        // Create pending admission payment with line items
        $createPendingPayment = new CreatePendingAdmissionPaymentAction();
        $pendingPayment = $createPendingPayment->execute($member);

        // Log the approval with all program references
        $referencesText = implode(', ', $programReferences);
        $member->log('approved', 'Member registration approved by ' . Auth::user()->name . '. Program References: ' . $referencesText . '. Pending payment created: ' . $pendingPayment->receipt_number);

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
