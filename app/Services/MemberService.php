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
        protected GenerateQRCodeAction $generateQRCode,
        protected NotificationService $notificationService
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

            // Enroll in selected programs
            if (!empty($data['program_ids'])) {
                foreach ($data['program_ids'] as $programId) {
                    $member->enrollInProgram($programId, 'active');
                }
            }

            // Send registration received notification
            $this->notificationService->sendRegistrationReceived($member);

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

            // Admission fee payment is now handled by ApproveMemberRegistrationAction -> CreatePendingAdmissionPaymentAction

            // Send welcome notification with temporary password
            $temporaryPassword = $user->temporary_password ?? null;
            if ($temporaryPassword) {
                $this->notificationService->sendWelcomeEmail($member->fresh(), $temporaryPassword);
            }

            // Send approval notification
            $this->notificationService->sendApprovalNotification($member->fresh());

            return [
                'member' => $member->fresh(),
                'user' => $user,
                'schedules_count' => count($schedules),
                'qr_code_url' => $qrCodeUrl,
                'temporary_password' => $temporaryPassword,
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
     * Update member programs and regenerate schedules
     */
    public function updatePrograms(Member $member, array $programIds): Member
    {
        return DB::transaction(function () use ($member, $programIds) {
            // Get current program IDs to find additions
            $currentProgramIds = $member->programs()->pluck('programs.id')->toArray();
            
            // Sync programs with manual UUID generation for pivot table
            $syncData = collect($programIds)->mapWithKeys(function ($id) {
                return [$id => ['id' => (string) Str::uuid(), 'status' => 'active']];
            })->all();
            
            $member->programs()->sync($syncData);

            // Find newly added programs
            $addedProgramIds = array_diff($programIds, $currentProgramIds);
            
            if (!empty($addedProgramIds)) {
                $addedPrograms = \App\Models\Program::whereIn('id', $addedProgramIds)->get();
                
                // 1. Create Admission Fee Payment for new programs
                $additionalAdmissionFee = $addedPrograms->sum('admission_fee');
                if ($additionalAdmissionFee > 0) {
                    $receiptGenerator = new \App\Actions\GenerateReceiptNumberAction();
                    $receiptNumber = $receiptGenerator->execute(now());
                    
                    $payment = \App\Models\Payment::create([
                        'member_id' => $member->id,
                        'type' => \App\Enums\PaymentType::ADMISSION,
                        'amount' => $additionalAdmissionFee,
                        'month_year' => now()->format('Y-m'),
                        'status' => \App\Enums\PaymentStatus::PENDING,
                        'due_date' => now()->addDays(7), // Give 7 days to pay
                        'paid_date' => null, // Not paid yet
                        'payment_method' => null, // Will be set when paid
                        'receipt_number' => $receiptNumber,
                        'notes' => 'Admission fee for newly added programs: ' . $addedPrograms->pluck('name')->implode(', '),
                    ]);

                    // Add items for the new programs so UI can render breakdowns
                    foreach ($addedPrograms as $program) {
                        if ($program->admission_fee > 0) {
                            \App\Models\PaymentItem::create([
                                'payment_id' => $payment->id,
                                'program_id' => $program->id,
                                'type' => \App\Enums\PaymentType::ADMISSION,
                                'amount' => $program->admission_fee,
                                'month_year' => null,
                                'description' => "{$program->name} - Admission Fee",
                            ]);
                        }
                    }
                }

                // 2. Generate schedules for new programs (starting current month)
                // We reload programs relation to ensure new ones are included
                $member->load('programs');
                $this->generatePaymentSchedule->execute($member, 12, \Carbon\Carbon::parse(now()->startOfMonth()));
            }

            // Update future payment schedules amount for existing programs (if fees changed)
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
            'active_programs_count' => $member->active_programs_count,
            'total_monthly_fee' => $member->total_monthly_fee,
            'last_payment' => $member->last_payment,
            'next_due_payment' => $member->next_due_payment,
            'last_attendance' => $member->last_attendance,
        ];
    }
}
