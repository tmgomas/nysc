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
use Illuminate\Support\Str;

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
            // Get current sport IDs to find additions
            $currentSportIds = $member->sports()->pluck('sports.id')->toArray();
            
            // Sync sports with manual UUID generation for pivot table
            $syncData = collect($sportIds)->mapWithKeys(function ($id) {
                return [$id => ['id' => (string) Str::uuid(), 'status' => 'active']];
            })->all();
            
            $member->sports()->sync($syncData);

            // Find newly added sports
            $addedSportIds = array_diff($sportIds, $currentSportIds);
            
            if (!empty($addedSportIds)) {
                $addedSports = \App\Models\Sport::whereIn('id', $addedSportIds)->get();
                
                // 1. Create Admission Fee Payment for new sports
                $additionalAdmissionFee = $addedSports->sum('admission_fee');
                if ($additionalAdmissionFee > 0) {
                    \App\Models\Payment::create([
                        'member_id' => $member->id,
                        'type' => \App\Enums\PaymentType::ADMISSION,
                        'amount' => $additionalAdmissionFee,
                        'month_year' => now()->format('Y-m'),
                        'status' => \App\Enums\PaymentStatus::PENDING,
                        'due_date' => now()->addDays(7), // Give 7 days to pay
                        'paid_date' => null, // Not paid yet
                        'payment_method' => null, // Will be set when paid
                        'notes' => 'Admission fee for newly added sports: ' . $addedSports->pluck('name')->implode(', '),
                    ]);
                }

                // 2. Generate schedules for new sports (starting current month)
                // We reload sports relation to ensure new ones are included
                $member->load('sports');
                $this->generatePaymentSchedule->execute($member, 12, \Carbon\Carbon::parse(now()->startOfMonth()));
            }

            // Update future payment schedules amount for existing sports (if fees changed)
            // $this->generatePaymentSchedule->updateFutureSchedules($member); 
            // The execute() above handles creation. updateFutureSchedules handles amount updates. 
            // We can leave it or remove it if execute covers it. 
            // execute() ONLY creates if not existing. So we typically don't need updateFutureSchedules unless we suspect fee changes at the same time.
            // But let's keep it safely or just rely on execute filling gaps.
            
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
