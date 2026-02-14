<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function index()
    {
        $stats = $this->reportService->dashboardStats();

        // Get today's schedule
        $today = now()->format('l');
        $todaySchedule = [];

        $sports = \App\Models\Sport::active()
            ->select('id', 'name', 'schedule_type', 'schedule', 'short_code')
            ->with(['classes' => function ($query) use ($today) {
                $query->active()
                    ->where('day_of_week', $today)
                    ->with('coach:id,name')
                    ->orderBy('start_time');
            }])
            ->get();

        foreach ($sports as $sport) {
            if ($sport->schedule_type === 'class_based') {
                foreach ($sport->classes as $class) {
                    $todaySchedule[] = [
                        'sport_name' => $sport->name,
                        'label' => $class->label,
                        'start_time' => $class->start_time,
                        'end_time' => $class->end_time,
                        'coach' => $class->coach?->name,
                        'capacity' => $class->capacity,
                        'type' => 'class',
                    ];
                }
            } else {
                $schedule = $sport->schedule ?? [];
                if (isset($schedule[$today])) {
                    $todaySchedule[] = [
                        'sport_name' => $sport->name,
                        'start_time' => $schedule[$today]['start'] ?? null,
                        'end_time' => $schedule[$today]['end'] ?? null,
                        'type' => 'practice',
                    ];
                }
            }
        }

        usort($todaySchedule, fn($a, $b) => ($a['start_time'] ?? '') <=> ($b['start_time'] ?? ''));

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'todaySchedule' => $todaySchedule,
            'todayName' => $today,
        ]);
    }
}
