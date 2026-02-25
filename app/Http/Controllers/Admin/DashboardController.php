<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use App\Models\{Member, Payment, Attendance, Program};
use App\Enums\{MemberStatus, PaymentStatus};
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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

        $programs = \App\Models\Program::active()
            ->select('id', 'name', 'schedule_type', 'schedule', 'short_code')
            ->with(['classes' => function ($query) use ($today) {
                $query->active()
                    ->where('day_of_week', $today)
                    ->with('coach:id,name')
                    ->orderBy('start_time');
            }])
            ->get();

        foreach ($programs as $program) {
            if ($program->schedule_type === 'class_based') {
                foreach ($program->classes as $class) {
                    $todaySchedule[] = [
                        'sport_name' => $program->name,
                        'label' => $class->label,
                        'start_time' => $class->start_time,
                        'end_time' => $class->end_time,
                        'coach' => $class->coach?->name,
                        'capacity' => $class->capacity,
                        'type' => 'class',
                    ];
                }
            } else {
                $schedule = $program->schedule ?? [];
                if (isset($schedule[$today])) {
                    $todaySchedule[] = [
                        'sport_name' => $program->name,
                        'start_time' => $schedule[$today]['start'] ?? null,
                        'end_time' => $schedule[$today]['end'] ?? null,
                        'type' => 'practice',
                    ];
                }
            }
        }

        usort($todaySchedule, fn($a, $b) => ($a['start_time'] ?? '') <=> ($b['start_time'] ?? ''));

        // === NEW DATA FOR REDESIGNED DASHBOARD ===

        // 1. Attendance trend - last 7 days
        $attendanceTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $attendanceTrend[] = [
                'date' => $date->format('D'),
                'full_date' => $date->format('M d'),
                'count' => Attendance::whereDate('check_in_time', $date->toDateString())->count(),
            ];
        }

        // 2. Revenue trend - last 6 months
        $revenueTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $revenue = Payment::where('status', PaymentStatus::VERIFIED)
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('amount');
            $revenueTrend[] = [
                'month' => $month->format('M'),
                'revenue' => (float) $revenue,
            ];
        }

        // 3. Members by program (for pie / bar chart)
        $membersByProgram = Program::withCount(['members' => function ($query) {
            $query->where('member_programs.status', 'active');
        }])
            ->get()
            ->map(fn($p) => [
                'name' => $p->name,
                'value' => $p->members_count,
            ])
            ->filter(fn($p) => $p['value'] > 0)
            ->values()
            ->toArray();

        // 4. Recent members (last 5 registered)
        $recentMembers = Member::with('programs:id,name,short_code')
            ->orderByDesc('registration_date')
            ->limit(5)
            ->get(['id', 'full_name', 'calling_name', 'status', 'registration_date', 'photo_url'])
            ->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->full_name,
                'calling_name' => $m->calling_name,
                'status' => $m->status->value,
                'registration_date' => $m->registration_date?->format('M d, Y'),
                'programs' => $m->programs->pluck('short_code')->join(', '),
                'initials' => collect(explode(' ', $m->full_name))->map(fn($w) => strtoupper($w[0] ?? ''))->take(2)->join(''),
            ]);

        // 5. Recent payments (last 5)
        $recentPayments = Payment::with('member:id,full_name,calling_name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'member_id', 'amount', 'status', 'type', 'created_at', 'payment_method'])
            ->map(fn($p) => [
                'id' => $p->id,
                'member_name' => $p->member?->calling_name ?? $p->member?->full_name ?? 'Unknown',
                'amount' => (float) $p->amount,
                'status' => $p->status->value,
                'type' => $p->type->label(),
                'date' => $p->created_at->format('M d, Y'),
            ]);

        // 6. Overdue payments alert (top 5)
        $overduePayments = Payment::with('member:id,full_name,calling_name,contact_number')
            ->where('status', PaymentStatus::PENDING)
            ->where('due_date', '<', now())
            ->orderBy('due_date')
            ->limit(5)
            ->get(['id', 'member_id', 'amount', 'due_date', 'type'])
            ->map(fn($p) => [
                'id' => $p->id,
                'member_id' => $p->member_id,
                'member_name' => $p->member?->calling_name ?? $p->member?->full_name ?? 'Unknown',
                'amount' => (float) $p->amount,
                'due_date' => $p->due_date?->format('M d, Y'),
                'days_overdue' => now()->diffInDays($p->due_date),
                'type' => $p->type->label(),
            ]);

        // 7. Pending registrations (members with pending status)
        $pendingRegistrations = Member::where('status', MemberStatus::PENDING)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'full_name', 'calling_name', 'created_at', 'contact_number'])
            ->map(fn($m) => [
                'id' => $m->id,
                'name' => $m->full_name,
                'calling_name' => $m->calling_name,
                'applied_at' => $m->created_at->diffForHumans(),
                'initials' => collect(explode(' ', $m->full_name))->map(fn($w) => strtoupper($w[0] ?? ''))->take(2)->join(''),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'todaySchedule' => $todaySchedule,
            'todayName' => $today,
            'attendanceTrend' => $attendanceTrend,
            'revenueTrend' => $revenueTrend,
            'membersByProgram' => $membersByProgram,
            'recentMembers' => $recentMembers,
            'recentPayments' => $recentPayments,
            'overduePayments' => $overduePayments,
            'pendingRegistrations' => $pendingRegistrations,
        ]);
    }
}
