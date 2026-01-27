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
        
        if (!$member->relationLoaded('sports')) {
            $member->load('sports');
        }

        $activeSports = $member->sports->filter(function ($sport) {
            return $sport->pivot->status === 'active';
        });

        if ($activeSports->isEmpty()) {
            return []; // No active sports, no schedules
        }

        $schedules = [];

        for ($i = 0; $i < $months; $i++) {
            $dueDate = $startDate->copy()->addMonths($i);
            $monthYear = $dueDate->format('Y-m');

            foreach ($activeSports as $sport) {
                // Check if schedule already exists for this sport and month
                $existing = MemberPaymentSchedule::where('member_id', $member->id)
                    ->where('sport_id', $sport->id)
                    ->where('month_year', $monthYear)
                    ->first();

                if (!$existing) {
                    $schedule = MemberPaymentSchedule::create([
                        'member_id' => $member->id,
                        'sport_id' => $sport->id,
                        'month_year' => $monthYear,
                        'amount' => $sport->monthly_fee,
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
     * Update schedule when member's sports change or fees change
     */
    public function updateFutureSchedules(Member $member): int
    {
        if (!$member->relationLoaded('sports')) {
            $member->load('sports');
        }

        $count = 0;
        $activeSports = $member->sports->filter(function ($sport) {
            return $sport->pivot->status === 'active';
        });

        foreach ($activeSports as $sport) {
            $count += MemberPaymentSchedule::where('member_id', $member->id)
                ->where('sport_id', $sport->id)
                ->where('status', ScheduleStatus::PENDING)
                ->where('due_date', '>', now())
                ->update(['amount' => $sport->monthly_fee]);
        }

        // Optional: We might want to cancel/delete schedules for sports that are no longer active
        // But for now, we just update active ones.

        return $count;
    }
}
