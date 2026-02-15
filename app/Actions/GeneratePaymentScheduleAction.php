<?php

namespace App\Actions;

use App\Models\Member;
use App\Models\MemberPaymentSchedule;
use App\Enums\ScheduleStatus;
use Carbon\Carbon;

class GeneratePaymentScheduleAction
{
    /**
     * Generate monthly payment schedule for a member
     * 
     * @param Member $member
     * @param int $months Number of months to generate (default 12)
     * @param Carbon|null $startDate Start date (default next month)
     */
    public function execute(Member $member, int $months = 12, ?Carbon $startDate = null): array
    {
        $startDate = $startDate ?? now()->addMonth()->startOfMonth();
        
        if (!$member->relationLoaded('programs')) {
            $member->load('programs');
        }

        $activePrograms = $member->programs->filter(function ($program) {
            return $program->pivot->status === 'active';
        });

        if ($activePrograms->isEmpty()) {
            return []; // No active programs, no schedules
        }

        $schedules = [];

        for ($i = 0; $i < $months; $i++) {
            $dueDate = $startDate->copy()->addMonths($i);
            $monthYear = $dueDate->format('Y-m');

            foreach ($activePrograms as $program) {
                // Check if schedule already exists for this program and month
                $existing = MemberPaymentSchedule::where('member_id', $member->id)
                    ->where('program_id', $program->id)
                    ->where('month_year', $monthYear)
                    ->first();

                if (!$existing) {
                    $schedule = MemberPaymentSchedule::create([
                        'member_id' => $member->id,
                        'program_id' => $program->id,
                        'month_year' => $monthYear,
                        'amount' => $program->monthly_fee,
                        'status' => ScheduleStatus::PENDING,
                        'due_date' => $dueDate->endOfMonth(),
                    ]);

                    $schedules[] = $schedule;
                }
            }
        }

        return $schedules;
    }

    /**
     * Update schedule when member's programs change or fees change
     */
    public function updateFutureSchedules(Member $member): int
    {
        if (!$member->relationLoaded('programs')) {
            $member->load('programs');
        }

        $count = 0;
        $activePrograms = $member->programs->filter(function ($program) {
            return $program->pivot->status === 'active';
        });

        foreach ($activePrograms as $program) {
            $count += MemberPaymentSchedule::where('member_id', $member->id)
                ->where('program_id', $program->id)
                ->where('status', ScheduleStatus::PENDING)
                ->where('due_date', '>', now())
                ->update(['amount' => $program->monthly_fee]);
        }

        // Optional: We might want to cancel/delete schedules for programs that are no longer active
        // But for now, we just update active ones.

        return $count;
    }
}
