<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{ClassAbsence, MemberProgramClass};
use App\Services\ClassAbsenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassAbsenceApiController extends Controller
{
    public function __construct(
        protected ClassAbsenceService $absenceService
    ) {}

    /**
     * GET /api/member/classes
     * Member's assigned class slots + upcoming 30-day occurrences
     */
    public function myClasses()
    {
        $member = Auth::user()->member;

        $assignments = \App\Models\MemberProgramClass::with([
            'programClass.program',
            'programClass.coach',
            'programClass.cancellations',
        ])
            ->where('member_id', $member->id)
            ->where('status', 'active')
            ->get();

        $classes = $assignments->map(function ($assignment) {
            $cls = $assignment->programClass;

            // Generate upcoming occurrences for next 30 days
            $upcoming = $this->getUpcomingDates($cls, days: 30);

            return [
                'assignment_id'    => $assignment->id,
                'program_class_id' => $cls->id,
                'program_name'     => $cls->program->name,
                'program_id'       => $cls->program_id,
                'day_of_week'      => $cls->day_of_week,
                'start_time'       => $cls->start_time,
                'end_time'         => $cls->end_time,
                'label'            => $cls->label,
                'coach_name'       => $cls->coach?->name,
                'formatted_time'   => $cls->formatted_time,
                'upcoming_dates'   => $upcoming,
            ];
        });

        return response()->json(['classes' => $classes]);
    }

    /**
     * Generate upcoming class dates for a given ProgramClass within N days.
     * Skips cancelled dates.
     */
    private function getUpcomingDates(\App\Models\ProgramClass $cls, int $days = 30): array
    {
        $dayMap = [
            'monday'    => 1,
            'tuesday'   => 2,
            'wednesday' => 3,
            'thursday'  => 4,
            'friday'    => 5,
            'saturday'  => 6,
            'sunday'    => 0,
        ];

        $targetDay    = $dayMap[strtolower($cls->day_of_week)] ?? -1;
        $cancelledDates = $cls->cancellations
            ->pluck('cancelled_date')
            ->map(fn($d) => $d->format('Y-m-d'))
            ->toArray();

        $upcoming = [];
        $date     = now()->startOfDay();
        $end      = now()->addDays($days)->endOfDay();

        while ($date->lte($end)) {
            if ($date->dayOfWeek === $targetDay) {
                $dateStr = $date->format('Y-m-d');
                $upcoming[] = [
                    'date'         => $dateStr,
                    'day_short'    => $date->format('D'),     // Mon, Tue...
                    'day_long'     => $date->format('l'),     // Monday...
                    'display_date' => $date->format('M j'),   // Feb 24
                    'is_today'     => $date->isToday(),
                    'is_tomorrow'  => $date->isTomorrow(),
                    'is_cancelled' => in_array($dateStr, $cancelledDates),
                    'cancel_reason'=> $cls->cancellations
                        ->firstWhere('cancelled_date', $date->copy())
                        ?->reason,
                ];
            }
            $date->addDay();
        }

        return $upcoming;
    }


    /**
     * GET /api/member/absences
     * Member's own absence history
     */
    public function myAbsences()
    {
        $member = Auth::user()->member;

        $absences = ClassAbsence::with(['programClass.program', 'makeupClass'])
            ->where('member_id', $member->id)
            ->orderByDesc('absent_date')
            ->get()
            ->map(function ($absence) {
                return [
                    'id'               => $absence->id,
                    'program_class_id' => $absence->program_class_id,
                    'absent_date'      => $absence->absent_date->format('Y-m-d'),
                    'reason'           => $absence->reason,
                    'status'           => $absence->status,
                    'admin_notes'      => $absence->admin_notes,
                    'makeup_deadline'  => $absence->makeup_deadline?->format('Y-m-d'),
                    'days_left'        => $absence->daysLeftForMakeup(),
                    'makeup_class_id'  => $absence->makeup_class_id,
                    'makeup_date'      => $absence->makeup_date?->format('Y-m-d'),

                    // Nested program_class for Flutter model
                    'program_class' => $absence->programClass ? [
                        'id'             => $absence->programClass->id,
                        'label'          => $absence->programClass->label,
                        'day_of_week'    => $absence->programClass->day_of_week,
                        'start_time'     => $absence->programClass->start_time,
                        'end_time'       => $absence->programClass->end_time,
                        'formatted_time' => $absence->programClass->formatted_time,
                        'program'        => $absence->programClass->program ? [
                            'id'   => $absence->programClass->program->id,
                            'name' => $absence->programClass->program->name,
                        ] : null,
                    ] : null,

                    // Nested makeup_class for Flutter model
                    'makeup_class' => $absence->makeupClass ? [
                        'id'             => $absence->makeupClass->id,
                        'label'          => $absence->makeupClass->label,
                        'day_of_week'    => $absence->makeupClass->day_of_week,
                        'formatted_time' => $absence->makeupClass->formatted_time,
                    ] : null,
                ];
            });

        return response()->json(['absences' => $absences]);
    }


    /**
     * POST /api/member/absences
     * Member reports an absence
     */
    public function reportAbsence(Request $request)
    {
        $validated = $request->validate([
            'program_class_id' => 'required|exists:program_classes,id',
            'absent_date'      => 'required|date|after_or_equal:today',
            'reason'           => 'nullable|string|max:500',
        ]);

        $member = Auth::user()->member;

        $absence = $this->absenceService->reportAbsence(
            $member,
            $validated['program_class_id'],
            $validated['absent_date'],
            $validated['reason'] ?? null
        );

        return response()->json([
            'message' => 'Absence reported successfully. Awaiting admin approval.',
            'absence' => [
                'id'          => $absence->id,
                'absent_date' => $absence->absent_date->format('Y-m-d'),
                'status'      => $absence->status,
            ],
        ], 201);
    }

    /**
     * GET /api/member/absences/{absence}/makeup-slots
     * Get available makeup slots for a given absence
     */
    public function availableMakeupSlots(ClassAbsence $absence)
    {
        $member = Auth::user()->member;

        if ($absence->member_id !== $member->id) {
            return response()->json(['error' => 'Not authorized.'], 403);
        }

        if ($absence->status !== 'approved') {
            return response()->json(['error' => 'Absence has not been approved yet.'], 422);
        }

        if ($absence->isDeadlineExpired()) {
            return response()->json(['error' => 'Makeup selection deadline has expired.'], 422);
        }

        // Check monthly makeup limit
        $monthMakeups = ClassAbsence::where('member_id', $member->id)
            ->whereMonth('absent_date', $absence->absent_date->month)
            ->whereYear('absent_date', $absence->absent_date->year)
            ->whereIn('status', ['makeup_selected', 'completed'])
            ->count();

        if ($monthMakeups >= 2) {
            return response()->json(['error' => 'Maximum 2 makeup classes per month already used.'], 422);
        }

        $slots = $this->absenceService->availableMakeupSlots($absence)
            ->map(function ($slot) {
                return [
                    'id'              => $slot->id,
                    'label'           => $slot->label,
                    'day_of_week'     => $slot->day_of_week,
                    'start_time'      => $slot->start_time,
                    'end_time'        => $slot->end_time,
                    'formatted_time'  => $slot->formatted_time,
                    'available_spots' => $slot->available_spots,
                    'is_full'         => $slot->is_full,
                ];
            });

        return response()->json([
            'slots'          => $slots,
            'days_remaining' => $absence->daysLeftForMakeup(),
            'deadline'       => $absence->makeup_deadline?->format('Y-m-d'),
            'makeups_used'   => $monthMakeups,
            'makeups_limit'  => 2,
        ]);
    }

    /**
     * POST /api/member/absences/{absence}/select-makeup
     * Member selects a makeup class
     */
    public function selectMakeup(Request $request, ClassAbsence $absence)
    {
        $member = Auth::user()->member;

        if ($absence->member_id !== $member->id) {
            return response()->json(['error' => 'Not authorized.'], 403);
        }

        $validated = $request->validate([
            'makeup_class_id' => 'required|exists:program_classes,id',
            'makeup_date'     => 'required|date',
        ]);

        $absence = $this->absenceService->selectMakeup(
            $absence,
            $validated['makeup_class_id'],
            $validated['makeup_date']
        );

        return response()->json([
            'message' => 'Makeup class booked successfully!',
            'absence' => [
                'id'          => $absence->id,
                'status'      => $absence->status,
                'makeup_date' => $absence->makeup_date?->format('Y-m-d'),
                'makeup_class'=> $absence->makeupClass?->label,
            ],
        ]);
    }
}
