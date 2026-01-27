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
        $monthlyFee = $member->total_monthly_fee;

        if ($monthlyFee <= 0) {
            throw new \Exception('Member has no active sports with monthly fees');
        }

        $schedules = [];

        for ($i = 0; $i < $months; $i++) {
            $dueDate = $startDate->copy()->addMonths($i);
            $monthYear = $dueDate->format('Y-m');

            // Check if schedule already exists
            $existing = MemberPaymentSchedule::where('member_id', $member->id)
                ->where('month_year', $monthYear)
                ->first();

            if (!$existing) {
                $schedule = MemberPaymentSchedule::create([
                    'member_id' => $member->id,
                    'month_year' => $monthYear,
                    'amount' => $monthlyFee,
                    'status' => ScheduleStatus::PENDING,
                    'due_date' => $dueDate->endOfMonth(),
                ]);

                $schedules[] = $schedule;
            }
        }

        return $schedules;
    }

    /**
     * Update schedule when member's sports change
     */
    public function updateFutureSchedules(Member $member): int
    {
        $newMonthlyFee = $member->total_monthly_fee;
        
        $updated = MemberPaymentSchedule::where('member_id', $member->id)
            ->where('status', ScheduleStatus::PENDING)
            ->where('due_date', '>', now())
            ->update(['amount' => $newMonthlyFee]);

        return $updated;
    }
}
