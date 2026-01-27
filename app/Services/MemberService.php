<?php

namespace App\Services;

use App\Models\Member;
use App\Actions\{
    GenerateMemberNumberAction,
    ApproveMemberRegistrationAction,
    CreateMemberAccountAction,
    GeneratePaymentScheduleAction,
    SuspendMemberAction,
    GenerateQRCodeAction
};
use App\Enums\MemberStatus;
use Illuminate\Support\Facades\DB;

class MemberService
{
    public function __construct(
        protected GenerateMemberNumberAction $generateMemberNumber,
        protected ApproveMemberRegistrationAction $approveMemberRegistration,
        protected CreateMemberAccountAction $createMemberAccount,
        protected GeneratePaymentScheduleAction $generatePaymentSchedule,
        protected SuspendMemberAction $suspendMember,
        protected GenerateQRCodeAction $generateQRCode
    ) {}

    /**
     * Register a new member
     */
    public function register(array $data): Member
    {
        return DB::transaction(function () use ($data) {
            $memberNumber = $this->generateMemberNumber->execute();

            $member = Member::create(array_merge($data, [
                'member_number' => $memberNumber,
                'status' => MemberStatus::PENDING,
                'registration_date' => now(),
            ]));

            // Enroll in selected sports
            if (!empty($data['sport_ids'])) {
                foreach ($data['sport_ids'] as $sportId) {
                    $member->enrollInSport($sportId, 'active');
                }
            }

            return $member;
        });
    }

    /**
     * Approve member and create account
     */
    public function approveAndCreateAccount(Member $member): array
    {
        return DB::transaction(function () use ($member) {
            // Approve member
            $this->approveMemberRegistration->execute($member);

            // Create user account
            $user = $this->createMemberAccount->execute($member);

            // Generate payment schedule
            $schedules = $this->generatePaymentSchedule->execute($member);

            // Generate QR code
            $qrCodeUrl = $this->generateQRCode->execute($member);

            // Create Admission Fee Payment
            $admissionFee = $member->sports->sum('admission_fee');
            if ($admissionFee > 0) {
                \App\Models\Payment::create([
                    'member_id' => $member->id,
                    'type' => \App\Enums\PaymentType::ADMISSION,
                    'amount' => $admissionFee,
                    'month_year' => now()->format('Y-m'),
                    'status' => \App\Enums\PaymentStatus::VERIFIED,
                    'paid_date' => now(),
                    'due_date' => now(),
                    'payment_method' => \App\Enums\PaymentMethod::CASH,
                    'verified_by' => \Illuminate\Support\Facades\Auth::id(),
                    'verified_at' => now(),
                    'notes' => 'Admission fee collected upon registration approval',
                ]);
            }

            return [
                'member' => $member->fresh(),
                'user' => $user,
                'schedules_count' => count($schedules),
                'qr_code_url' => $qrCodeUrl,
                'temporary_password' => $user->temporary_password ?? null,
            ];
        });
    }

    /**
     * Suspend member
     */
    public function suspend(Member $member, string $reason): Member
    {
        return $this->suspendMember->execute($member, $reason);
    }

    /**
     * Reactivate member
     */
    public function reactivate(Member $member): Member
    {
        return $this->suspendMember->reactivate($member);
    }

    /**
     * Update member sports and regenerate schedules
     */
    public function updateSports(Member $member, array $sportIds): Member
    {
        return DB::transaction(function () use ($member, $sportIds) {
            // Sync sports
            $member->sports()->sync($sportIds);

            // Update future payment schedules
            $this->generatePaymentSchedule->updateFutureSchedules($member);

            return $member->fresh();
        });
    }

    /**
     * Get member statistics
     */
    public function getStatistics(Member $member): array
    {
        return [
            'total_paid' => $member->total_paid,
            'total_pending' => $member->total_pending,
            'has_overdue' => $member->hasOverduePayments(),
            'monthly_attendance_count' => $member->monthly_attendance_count,
            'total_attendance_count' => $member->total_attendance_count,
            'active_sports_count' => $member->active_sports_count,
            'total_monthly_fee' => $member->total_monthly_fee,
            'last_payment' => $member->last_payment,
            'next_due_payment' => $member->next_due_payment,
            'last_attendance' => $member->last_attendance,
        ];
    }
}
