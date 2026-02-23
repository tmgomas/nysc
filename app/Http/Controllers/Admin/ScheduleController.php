<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramClass;
use App\Models\Holiday;
use App\Models\SpecialBooking;
use App\Models\Location;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ScheduleController extends Controller
{
    /**
     * Display the schedule calendar page.
     */
    public function index(Request $request)
    {
        $programs = Program::active()
            ->select('id', 'name', 'schedule_type', 'schedule', 'weekly_limit', 'location_id')
            ->with(['classes' => function ($query) {
                $query->with('coach:id,name', 'cancellations')
                    ->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")
                    ->orderBy('start_time');
            }, 'location:id,name'])
            ->get();

        $holidays = Holiday::orderBy('date')->get();
        $locations = Location::active()->orderBy('name')->get();

        $specialBookings = SpecialBooking::with('location:id,name')
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Admin/Schedule/Index', [
            'programs' => $programs,
            'holidays' => $holidays,
            'locations' => $locations,
            'specialBookings' => $specialBookings,
        ]);
    }

    /**
     * API endpoint for FullCalendar events.
     * Includes cancellation/holiday/booking logic.
     */
    public function events(Request $request)
    {
        $start = $request->input('start', now()->startOfMonth()->toDateString());
        $end = $request->input('end', now()->endOfMonth()->toDateString());
        $programId = $request->input('program_id'); // optional filter

        $programs = Program::active()
            ->select('id', 'name', 'schedule_type', 'schedule', 'short_code', 'location_id')
            ->when($programId, fn($q) => $q->where('id', $programId))
            ->with(['classes' => function ($query) {
                $query->with('coach:id,name', 'cancellations');
            }, 'location:id,name'])
            ->get();

        // Pre-load holidays in range
        $holidays = Holiday::all();
        $holidayDates = $this->getHolidayDatesInRange($holidays, $start, $end);

        // Pre-load special bookings in range
        $specialBookings = SpecialBooking::cancelling()
            ->forDateRange($start, $end)
            ->with('location:id,name')
            ->get();

        $events = [];

        // Program color map
        $colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
            '#14b8a6',
        ];

        foreach ($programs as $index => $program) {
            $color = $colors[$index % count($colors)];

            if ($program->schedule_type === 'class_based') {
                foreach ($program->classes as $class) {
                    if (!$class->is_active) continue;

                    // Get cancelled dates for this class
                    $cancelledDates = $class->cancellations->pluck('cancelled_date')
                        ->map(fn($d) => Carbon::parse($d)->toDateString())
                        ->toArray();

                    // Generate individual events for the date range
                    $period = CarbonPeriod::create($start, $end);
                    foreach ($period as $date) {
                        if ($date->format('l') !== $class->day_of_week) continue;

                        // Check valid_from / valid_to
                        if ($class->valid_from && $date->lt(Carbon::parse($class->valid_from))) continue;
                        if ($class->valid_to && $date->gt(Carbon::parse($class->valid_to))) continue;

                        $dateStr = $date->toDateString();
                        $isCancelled = false;
                        $cancelReason = null;

                        // Check specific date cancellation
                        if (in_array($dateStr, $cancelledDates)) {
                            $isCancelled = true;
                            $cancelReason = 'Cancelled';
                        }

                        // Check holiday
                        if (!$isCancelled && in_array($dateStr, $holidayDates)) {
                            $isCancelled = true;
                            $holiday = $this->findHolidayForDate($holidays, $dateStr);
                            $cancelReason = 'Holiday: ' . ($holiday?->name ?? '');
                        }

                        // Check special booking
                        if (!$isCancelled && $program->location_id) {
                            foreach ($specialBookings as $booking) {
                                if ($booking->location_id === $program->location_id
                                    && $date->between($booking->start_date, $booking->end_date)
                                    && $booking->overlapsTime($class->start_time, $class->end_time)
                                ) {
                                    $isCancelled = true;
                                    $cancelReason = 'Booking: ' . $booking->title;
                                    break;
                                }
                            }
                        }

                        $events[] = [
                            'id' => $class->id . '-' . $dateStr,
                            'title' => $program->name . ($class->label ? " - {$class->label}" : ''),
                            'start' => $dateStr . 'T' . $class->start_time,
                            'end' => $dateStr . 'T' . $class->end_time,
                            'backgroundColor' => $isCancelled ? '#9ca3af' : $color,
                            'borderColor' => $isCancelled ? '#6b7280' : $color,
                            'classNames' => $isCancelled ? ['fc-event-cancelled'] : [],
                            'extendedProps' => [
                                'program_id' => $program->id,
                                'sport_name' => $program->name,
                                'class_id' => $class->id,
                                'coach' => $class->coach?->name,
                                'capacity' => $class->capacity,
                                'label' => $class->label,
                                'location' => $program->location?->name,
                                'type' => 'class',
                                'is_cancelled' => $isCancelled,
                                'cancel_reason' => $cancelReason,
                            ],
                        ];
                    }
                }
            } else {
                // Practice days from schedule JSON
                $schedule = $program->schedule ?? [];
                foreach ($schedule as $day => $times) {
                    $period = CarbonPeriod::create($start, $end);
                    foreach ($period as $date) {
                        if ($date->format('l') !== $day) continue;

                        $dateStr = $date->toDateString();
                        $isCancelled = false;
                        $cancelReason = null;

                        // Check holiday
                        if (in_array($dateStr, $holidayDates)) {
                            $isCancelled = true;
                            $holiday = $this->findHolidayForDate($holidays, $dateStr);
                            $cancelReason = 'Holiday: ' . ($holiday?->name ?? '');
                        }

                        // Check special booking
                        if (!$isCancelled && $program->location_id) {
                            foreach ($specialBookings as $booking) {
                                if ($booking->location_id === $program->location_id
                                    && $date->between($booking->start_date, $booking->end_date)
                                    && $booking->overlapsTime($times['start'] ?? null, $times['end'] ?? null)
                                ) {
                                    $isCancelled = true;
                                    $cancelReason = 'Booking: ' . $booking->title;
                                    break;
                                }
                            }
                        }

                        $events[] = [
                            'id' => $program->id . '-' . $day . '-' . $dateStr,
                            'title' => $program->name . ' Practice',
                            'start' => $dateStr . 'T' . ($times['start'] ?? '16:00'),
                            'end' => $dateStr . 'T' . ($times['end'] ?? '18:00'),
                            'backgroundColor' => $isCancelled ? '#9ca3af' : $color,
                            'borderColor' => $isCancelled ? '#6b7280' : $color,
                            'classNames' => $isCancelled ? ['fc-event-cancelled'] : [],
                            'extendedProps' => [
                                'program_id' => $program->id,
                                'sport_name' => $program->name,
                                'location' => $program->location?->name,
                                'type' => 'practice',
                                'is_cancelled' => $isCancelled,
                                'cancel_reason' => $cancelReason,
                            ],
                        ];
                    }
                }
            }
        }

        // Add holiday events (all-day)
        foreach ($holidayDates as $dateStr) {
            $holiday = $this->findHolidayForDate($holidays, $dateStr);
            if ($holiday && $dateStr >= $start && $dateStr <= $end) {
                $events[] = [
                    'id' => 'holiday-' . $dateStr,
                    'title' => '🎉 ' . $holiday->name,
                    'start' => $dateStr,
                    'allDay' => true,
                    'backgroundColor' => '#dc2626',
                    'borderColor' => '#dc2626',
                    'display' => 'background',
                    'extendedProps' => [
                        'type' => 'holiday',
                        'holiday_name' => $holiday->name,
                    ],
                ];
            }
        }

        // Add special booking events
        foreach ($specialBookings as $booking) {
            $events[] = [
                'id' => 'booking-' . $booking->id,
                'title' => '📋 ' . $booking->title,
                'start' => $booking->start_date->toDateString() . ($booking->start_time ? 'T' . $booking->start_time : ''),
                'end' => $booking->end_date->toDateString() . ($booking->end_time ? 'T' . $booking->end_time : ''),
                'allDay' => !$booking->start_time,
                'backgroundColor' => '#f97316',
                'borderColor' => '#f97316',
                'extendedProps' => [
                    'type' => 'booking',
                    'location' => $booking->location?->name,
                    'reason' => $booking->reason,
                    'title' => $booking->title,
                ],
            ];
        }

        return response()->json($events);
    }

    /**
     * Get today's schedule for dashboard widget.
     */
    public function today()
    {
        $today = now()->format('l');
        $todayDate = now()->toDateString();

        // Check if today is a holiday
        $holiday = Holiday::forDate($todayDate)->first();

        $programs = Program::active()
            ->select('id', 'name', 'schedule_type', 'schedule', 'short_code', 'location_id')
            ->with(['classes' => function ($query) use ($today) {
                $query->active()
                    ->where('day_of_week', $today)
                    ->with('coach:id,name', 'cancellations')
                    ->orderBy('start_time');
            }])
            ->withCount(['members' => function ($query) {
                $query->where('member_programs.status', 'active');
            }])
            ->get();

        // Check special bookings for today
        $todayBookings = SpecialBooking::cancelling()
            ->forDate($todayDate)
            ->get()
            ->keyBy('location_id');

        $todaySchedule = [];

        foreach ($programs as $program) {
            if ($program->schedule_type === 'class_based') {
                foreach ($program->classes as $class) {
                    $isCancelled = false;
                    $cancelReason = null;

                    // Check specific cancellation
                    if ($class->cancellations->contains(fn($c) => Carbon::parse($c->cancelled_date)->toDateString() === $todayDate)) {
                        $isCancelled = true;
                        $cancelReason = 'Cancelled';
                    }

                    // Check holiday
                    if (!$isCancelled && $holiday) {
                        $isCancelled = true;
                        $cancelReason = 'Holiday: ' . $holiday->name;
                    }

                    // Check special booking
                    if (!$isCancelled && $program->location_id && isset($todayBookings[$program->location_id])) {
                        $booking = $todayBookings[$program->location_id];
                        if ($booking->overlapsTime($class->start_time, $class->end_time)) {
                            $isCancelled = true;
                            $cancelReason = 'Booking: ' . $booking->title;
                        }
                    }

                    $todaySchedule[] = [
                        'sport_name' => $program->name,
                        'label' => $class->label,
                        'start_time' => $class->start_time,
                        'end_time' => $class->end_time,
                        'coach' => $class->coach?->name,
                        'capacity' => $class->capacity,
                        'type' => 'class',
                        'is_cancelled' => $isCancelled,
                        'cancel_reason' => $cancelReason,
                    ];
                }
            } else {
                $schedule = $program->schedule ?? [];
                if (isset($schedule[$today])) {
                    $isCancelled = false;
                    $cancelReason = null;

                    if ($holiday) {
                        $isCancelled = true;
                        $cancelReason = 'Holiday: ' . $holiday->name;
                    }

                    if (!$isCancelled && $program->location_id && isset($todayBookings[$program->location_id])) {
                        $booking = $todayBookings[$program->location_id];
                        if ($booking->overlapsTime($schedule[$today]['start'] ?? null, $schedule[$today]['end'] ?? null)) {
                            $isCancelled = true;
                            $cancelReason = 'Booking: ' . $booking->title;
                        }
                    }

                    $todaySchedule[] = [
                        'sport_name' => $program->name,
                        'start_time' => $schedule[$today]['start'] ?? null,
                        'end_time' => $schedule[$today]['end'] ?? null,
                        'members_count' => $program->members_count,
                        'type' => 'practice',
                        'is_cancelled' => $isCancelled,
                        'cancel_reason' => $cancelReason,
                    ];
                }
            }
        }

        usort($todaySchedule, fn($a, $b) => ($a['start_time'] ?? '') <=> ($b['start_time'] ?? ''));

        return response()->json([
            'day' => $today,
            'items' => $todaySchedule,
            'is_holiday' => $holiday ? true : false,
            'holiday_name' => $holiday?->name,
        ]);
    }

    /**
     * Get all holiday dates within a range, respecting recurring holidays.
     */
    private function getHolidayDatesInRange($holidays, string $start, string $end): array
    {
        $dates = [];
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);

        foreach ($holidays as $holiday) {
            if ($holiday->is_recurring) {
                // For recurring, check each year in range
                for ($year = $startDate->year; $year <= $endDate->year; $year++) {
                    $recurDate = Carbon::parse($holiday->date)->setYear($year)->toDateString();
                    if ($recurDate >= $start && $recurDate <= $end) {
                        $dates[] = $recurDate;
                    }
                }
            } else {
                $dateStr = Carbon::parse($holiday->date)->toDateString();
                if ($dateStr >= $start && $dateStr <= $end) {
                    $dates[] = $dateStr;
                }
            }
        }

        return array_unique($dates);
    }

    /**
     * Find the holiday record for a specific date.
     */
    private function findHolidayForDate($holidays, string $dateStr): ?Holiday
    {
        $date = Carbon::parse($dateStr);
        foreach ($holidays as $holiday) {
            $hDate = Carbon::parse($holiday->date);
            if ($holiday->is_recurring) {
                if ($hDate->month === $date->month && $hDate->day === $date->day) {
                    return $holiday;
                }
            } else {
                if ($hDate->toDateString() === $dateStr) {
                    return $holiday;
                }
            }
        }
        return null;
    }

    private function dayToNumber(string $day): int
    {
        return match ($day) {
            'Sunday' => 0,
            'Monday' => 1,
            'Tuesday' => 2,
            'Wednesday' => 3,
            'Thursday' => 4,
            'Friday' => 5,
            'Saturday' => 6,
            default => 1,
        };
    }
}
