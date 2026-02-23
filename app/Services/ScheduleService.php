<?php

namespace App\Services;

use App\Models\Member;
use App\Models\Holiday;
use App\Models\ClassCancellation;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ScheduleService
{
    /**
     * Get upcoming scheduled classes for a member
     * grouped by date for mobile calendar display.
     *
     * Handles TWO program types:
     *  - practice_days : Schedule from Program.schedule JSON (no slot assignment needed)
     *  - class_based   : Schedule from member's MemberProgramClass assignments
     *
     * @param  Member  $member
     * @param  int     $days  Number of days to look ahead
     * @return array
     */
    public function getUpcomingSchedule(Member $member, int $days = 30): array
    {
        $now   = Carbon::now();
        $until = $now->copy()->addDays($days);

        // ── Load all required relationships ──────────────────────────
        $member->loadMissing([
            // Active program enrollments
            'programs' => fn($q) => $q->wherePivot('status', 'active')->with('location'),

            // Active class-slot assignments
            'programClasses' => fn($q) => $q->where('status', 'active'),
            'programClasses.programClass.program.location',
            'programClasses.programClass.coach',
        ]);

        // ── Pre-compute holidays ──────────────────────────────────────
        $holidays = Holiday::where(function ($q) use ($now, $until) {
            $q->whereBetween('date', [$now->toDateString(), $until->toDateString()])
              ->where('is_recurring', false);
        })->orWhere('is_recurring', true)->get();

        $holidayLookup = $this->buildHolidayLookup($holidays, $now, $days);

        // ── Pre-compute cancellations for class_based slots ───────────
        $classIds = $member->programClasses
            ->where('status', 'active')
            ->pluck('program_class_id')
            ->unique();

        $cancellations = collect();
        if ($classIds->isNotEmpty()) {
            $cancellations = ClassCancellation::whereIn('program_class_id', $classIds)
                ->whereDate('cancelled_date', '>=', $now->toDateString())
                ->whereDate('cancelled_date', '<=', $until->toDateString())
                ->get()
                ->groupBy(fn($item) => $item->program_class_id . '_' . $item->cancelled_date->toDateString());
        }

        // ── Generate occurrences from both program types ──────────────
        $occurrences = collect();

        $activePrograms = $member->programs->filter(fn($p) => $p->pivot?->status === 'active');

        foreach ($activePrograms as $program) {
            if ($program->schedule_type === 'practice_days') {
                // ── TIER 1: Practice-days programs ──
                $this->generatePracticeDayOccurrences(
                    $program, $now, $until, $holidayLookup, $occurrences
                );
            } else {
                // ── TIER 2: Class-based — only enrolled slots ──
                $memberClasses = $member->programClasses
                    ->where('status', 'active')
                    ->filter(fn($mc) => $mc->programClass?->program_id === $program->id);

                foreach ($memberClasses as $memberClass) {
                    $cls = $memberClass->programClass;

                    if (! $cls || ! $cls->is_active) {
                        continue;
                    }

                    // valid_from / valid_to bounds
                    if ($cls->valid_to && Carbon::parse($cls->valid_to)->lt($now)) {
                        continue;
                    }
                    if ($cls->valid_from && Carbon::parse($cls->valid_from)->gt($until)) {
                        continue;
                    }

                    $this->generateClassOccurrences(
                        $cls, $now, $until, $cancellations, $holidayLookup, $occurrences
                    );
                }
            }
        }

        return $this->buildResponse($occurrences, $now);
    }

    /**
     * Get member's enrolled programs with schedule info.
     * Returns schedule_type-aware data for both program types.
     *
     * @param  Member  $member
     * @return array
     */
    public function getMemberPrograms(Member $member): array
    {
        $member->loadMissing([
            'programs' => fn($q) => $q->wherePivot('status', 'active'),
            'programs.location',
        ]);

        $activePrograms = $member->programs->filter(
            fn($p) => $p->pivot?->status === 'active'
        );

        return $activePrograms->map(function ($program) use ($member) {

            $base = [
                'id'            => $program->id,
                'name'          => $program->name,
                'short_code'    => $program->short_code,
                'monthly_fee'   => $program->monthly_fee,
                'location'      => $program->location?->name,
                'enrolled_at'   => $program->pivot?->enrolled_at,
                'status'        => $program->pivot?->status,
                'schedule_type' => $program->schedule_type,
            ];

            if ($program->schedule_type === 'practice_days') {
                // Build nice practice days array from JSON
                $schedule = $program->schedule ?? [];
                $practiceDays = collect($schedule)->map(fn($times, $day) => [
                    'day'            => $day,
                    'start_time'     => $times['start'] ?? null,
                    'end_time'       => $times['end'] ?? null,
                    'formatted_time' => isset($times['start'], $times['end'])
                        ? Carbon::parse($times['start'])->format('g:i A') . ' - ' . Carbon::parse($times['end'])->format('g:i A')
                        : null,
                ])->values();

                $base['practice_days']    = $practiceDays;
                $base['assigned_classes'] = [];

            } else {
                // class_based: show assigned class slots
                $assignedClasses = $member->programClasses()
                    ->where('status', 'active')
                    ->whereHas('programClass', fn($q) => $q->where('program_id', $program->id))
                    ->with('programClass.coach')
                    ->get()
                    ->map(fn($mc) => [
                        'id'             => $mc->programClass->id,
                        'label'          => $mc->programClass->label,
                        'day_of_week'    => ucfirst($mc->programClass->day_of_week),
                        'formatted_time' => $mc->programClass->formatted_time,
                        'coach'          => $mc->programClass->coach?->name,
                    ]);

                $base['practice_days']    = [];
                $base['assigned_classes'] = $assignedClasses->values();
            }

            return $base;
        })->values()->toArray();
    }

    // ---------------------------------------------------------------
    //  Private helpers
    // ---------------------------------------------------------------

    /**
     * TIER 1 — Generate occurrences from Program.schedule JSON for practice_days programs.
     * No slot assignments needed — every enrolled member gets the same days.
     */
    private function generatePracticeDayOccurrences(
        $program,
        Carbon $from,
        Carbon $until,
        array $holidayLookup,
        Collection &$occurrences
    ): void {
        $schedule = $program->schedule ?? [];

        // schedule JSON: { "Monday": {"start": "16:00", "end": "18:00"}, ... }
        foreach ($schedule as $day => $times) {
            $dayOfWeek = strtolower($day); // normalise

            $startTime = $times['start'] ?? '00:00';
            $endTime   = $times['end']   ?? '00:00';

            // Format for display
            $formattedTime = Carbon::parse($startTime)->format('g:i A')
                . ' - ' . Carbon::parse($endTime)->format('g:i A');

            // Find first occurrence on or after $from
            $cursor = $from->copy()->startOfDay();
            while (strtolower($cursor->englishDayOfWeek) !== $dayOfWeek) {
                $cursor->addDay();
            }

            // If today: skip if practice time already passed
            if ($cursor->toDateString() === $from->toDateString()) {
                $todayPracticeTime = $from->copy()->setTimeFromTimeString($startTime);
                if ($todayPracticeTime->lte($from)) {
                    $cursor->addWeek();
                }
            }

            // Walk weekly
            while ($cursor->lte($until)) {
                $dateStr     = $cursor->toDateString();
                $holidayName = $holidayLookup[$dateStr] ?? null;

                // For practice_days, holidays simply mark the session (no explicit cancellations table)
                $status = $holidayName ? 'cancelled' : 'scheduled';

                $occurrences->push([
                    'id'                  => $program->id . '-practice-' . $day . '-' . $dateStr,
                    'program_class_id'    => null,
                    'date'                => $dateStr,
                    'day_of_week'         => ucfirst($dayOfWeek),
                    'start_time'          => Carbon::parse($startTime)->format('H:i'),
                    'end_time'            => Carbon::parse($endTime)->format('H:i'),
                    'formatted_time'      => $formattedTime,
                    'program_name'        => $program->name,
                    'program_short_code'  => $program->short_code,
                    'label'               => 'Practice',
                    'coach'               => null,
                    'location'            => $program->location?->name,
                    'schedule_type'       => 'practice_days',
                    'status'              => $status,
                    'cancellation_reason' => $holidayName ? "Holiday: {$holidayName}" : null,
                    'is_holiday'          => ! is_null($holidayName),
                    'holiday_name'        => $holidayName,
                ]);

                $cursor->addWeek();
            }
        }
    }

    /**
     * TIER 2 — Generate occurrences from a ProgramClass slot (class_based programs).
     */
    private function generateClassOccurrences(
        $cls,
        Carbon $from,
        Carbon $until,
        Collection $cancellations,
        array $holidayLookup,
        Collection &$occurrences
    ): void {
        $dayOfWeek = strtolower($cls->day_of_week);

        // Find first occurrence on or after $from
        $cursor = $from->copy()->startOfDay();
        while (strtolower($cursor->englishDayOfWeek) !== $dayOfWeek) {
            $cursor->addDay();
        }

        // If today: skip if class already started/passed
        if ($cursor->toDateString() === $from->toDateString()) {
            $todayClassTime = $from->copy()->setTimeFromTimeString($cls->start_time);
            if ($todayClassTime->lte($from)) {
                $cursor->addWeek();
            }
        }

        while ($cursor->lte($until)) {
            $dateStr   = $cursor->toDateString();
            $cancelKey = $cls->id . '_' . $dateStr;

            $status             = 'scheduled';
            $cancellationReason = null;

            if ($cancellations->has($cancelKey)) {
                $status             = 'cancelled';
                $cancellationReason = $cancellations->get($cancelKey)->first()?->reason;
            }

            $holidayName = $holidayLookup[$dateStr] ?? null;

            $occurrences->push([
                'id'                  => $cls->id . '-' . $dateStr,
                'program_class_id'    => $cls->id,
                'date'                => $dateStr,
                'day_of_week'         => ucfirst($dayOfWeek),
                'start_time'          => Carbon::parse($cls->start_time)->format('H:i'),
                'end_time'            => Carbon::parse($cls->end_time)->format('H:i'),
                'formatted_time'      => $cls->formatted_time,
                'program_name'        => $cls->program?->name,
                'program_short_code'  => $cls->program?->short_code,
                'label'               => $cls->label,
                'coach'               => $cls->coach?->name,
                'location'            => $cls->program?->location?->name,
                'schedule_type'       => 'class_based',
                'status'              => $status,
                'cancellation_reason' => $cancellationReason,
                'is_holiday'          => ! is_null($holidayName),
                'holiday_name'        => $holidayName,
            ]);

            $cursor->addWeek();
        }
    }

    /**
     * Pre-build a date→holiday_name lookup for O(1) access.
     */
    private function buildHolidayLookup(Collection $holidays, Carbon $from, int $days): array
    {
        $lookup = [];

        for ($i = 0; $i <= $days; $i++) {
            $date = $from->copy()->addDays($i);

            foreach ($holidays as $h) {
                if (! $h->is_recurring) {
                    $matches = $h->date->toDateString() === $date->toDateString();
                } else {
                    $matches = $h->date->month === $date->month && $h->date->day === $date->day;
                }

                if ($matches) {
                    $lookup[$date->toDateString()] = $h->name;
                    break;
                }
            }
        }

        return $lookup;
    }

    /**
     * Build the final grouped + sorted response payload.
     */
    private function buildResponse(Collection $occurrences, Carbon $now): array
    {
        $sorted = $occurrences
            ->sortBy(fn($o) => $o['date'] . ' ' . $o['start_time'])
            ->values();

        // Group by date
        $grouped = $sorted
            ->groupBy('date')
            ->map(fn($dayClasses, $date) => [
                'date'    => $date,
                'classes' => $dayClasses->values(),
            ])
            ->values();

        $nextScheduled = $sorted->firstWhere('status', 'scheduled');

        return [
            'summary' => [
                'total_upcoming'           => $sorted->count(),
                'total_upcoming_scheduled' => $sorted->where('status', 'scheduled')->count(),
                'next_class'               => $nextScheduled ? [
                    'date'           => $nextScheduled['date'],
                    'formatted_time' => $nextScheduled['formatted_time'],
                    'program_name'   => $nextScheduled['program_name'],
                    'coach'          => $nextScheduled['coach'],
                    'schedule_type'  => $nextScheduled['schedule_type'],
                ] : null,
            ],
            'upcoming_classes' => $grouped,
        ];
    }
}
