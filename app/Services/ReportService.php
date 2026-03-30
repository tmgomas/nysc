<?php

namespace App\Services;

use App\Enums\MemberStatus;
use App\Enums\PaymentStatus;
use App\Models\Attendance;
use App\Models\Coach;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Program;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Generate member report
     */
    public function memberReport(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now()->endOfMonth();

        return [
            'total_members' => Member::count(),
            'active_members' => Member::where('status', MemberStatus::ACTIVE)->count(),
            'pending_members' => Member::where('status', MemberStatus::PENDING)->count(),
            'suspended_members' => Member::where('status', MemberStatus::SUSPENDED)->count(),
            'new_registrations' => Member::whereBetween('registration_date', [$startDate, $endDate])->count(),
            'by_gender' => Member::select('gender', DB::raw('count(*) as count'))
                ->groupBy('gender')
                ->get()
                ->pluck('count', 'gender')
                ->toArray(),
            'by_program' => Program::withCount(['members' => function ($query) {
                $query->where('member_programs.status', 'active');
            }])
                ->get()
                ->map(function ($program) {
                    return [
                        'program' => $program->name,
                        'members' => $program->members_count,
                    ];
                })
                ->toArray(),
        ];
    }

    /**
     * Generate payment report
     */
    public function paymentReport(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now()->endOfMonth();

        $payments = Payment::whereBetween('created_at', [$startDate, $endDate]);

        return [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
            'verified_amount' => $payments->clone()->where('status', PaymentStatus::VERIFIED)->sum('amount'),
            'pending_amount' => $payments->clone()->where('status', PaymentStatus::PENDING)->sum('amount'),
            'by_type' => Payment::whereBetween('created_at', [$startDate, $endDate])
                ->select('type', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
                ->groupBy('type')
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => $item->type->label(),
                        'count' => $item->count,
                        'total' => $item->total,
                    ];
                })
                ->toArray(),
            'by_method' => Payment::whereBetween('created_at', [$startDate, $endDate])
                ->whereNotNull('payment_method')
                ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
                ->groupBy('payment_method')
                ->get()
                ->map(function ($item) {
                    return [
                        'method' => $item->payment_method->label(),
                        'count' => $item->count,
                        'total' => $item->total,
                    ];
                })
                ->toArray(),
        ];
    }

    /**
     * Generate attendance report
     */
    public function attendanceReport(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now()->endOfMonth();

        $attendances = Attendance::whereBetween('check_in_time', [$startDate, $endDate]);

        return [
            'total_attendances' => $attendances->count(),
            'unique_members' => $attendances->clone()->distinct('member_id')->count('member_id'),
            'average_daily' => round($attendances->count() / $startDate->diffInDays($endDate), 2),
            'by_program' => Program::withCount(['attendances' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('check_in_time', [$startDate, $endDate]);
            }])
                ->get()
                ->map(function ($program) {
                    return [
                        'program' => $program->name,
                        'attendances' => $program->attendances_count,
                    ];
                })
                ->toArray(),
            'by_method' => Attendance::whereBetween('check_in_time', [$startDate, $endDate])
                ->select('method', DB::raw('count(*) as count'))
                ->groupBy('method')
                ->get()
                ->map(function ($item) {
                    return [
                        'method' => $item->method->label(),
                        'count' => $item->count,
                    ];
                })
                ->toArray(),
        ];
    }

    /**
     * Generate revenue report
     */
    public function revenueReport(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now()->endOfMonth();

        $verifiedPayments = Payment::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', PaymentStatus::VERIFIED);

        return [
            'total_revenue' => $verifiedPayments->sum('amount'),
            'admission_revenue' => $verifiedPayments->clone()->where('type', 'admission')->sum('amount'),
            'monthly_revenue' => $verifiedPayments->clone()->where('type', 'monthly')->sum('amount'),
            'bulk_revenue' => $verifiedPayments->clone()->where('type', 'bulk')->sum('amount'),
            'by_program' => Program::all()->map(function ($program) use ($startDate, $endDate) {
                $revenue = Payment::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', PaymentStatus::VERIFIED)
                    ->whereHas('member.programs', function ($query) use ($program) {
                        $query->where('programs.id', $program->id);
                    })
                    ->sum('amount');

                return [
                    'program' => $program->name,
                    'revenue' => $revenue,
                ];
            })
                ->toArray(),
        ];
    }

    /**
     * Generate dashboard statistics
     */
    public function dashboardStats(): array
    {
        $totalPayments = Payment::where('status', PaymentStatus::PENDING)->count()
            + Payment::where('status', PaymentStatus::VERIFIED)->count();
        $verifiedPayments = Payment::where('status', PaymentStatus::VERIFIED)->count();
        $collectionRate = $totalPayments > 0 ? round(($verifiedPayments / $totalPayments) * 100, 1) : 0;

        $thisMonthRevenue = Payment::where('status', PaymentStatus::VERIFIED)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        $lastMonthRevenue = Payment::where('status', PaymentStatus::VERIFIED)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('amount');

        $revenueGrowth = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : null;

        $lastMonthMembers = Member::whereMonth('registration_date', now()->subMonth()->month)
            ->whereYear('registration_date', now()->subMonth()->year)
            ->count();
        $thisMonthMembers = Member::whereMonth('registration_date', now()->month)
            ->whereYear('registration_date', now()->year)
            ->count();
        $memberGrowth = $lastMonthMembers > 0
            ? round((($thisMonthMembers - $lastMonthMembers) / $lastMonthMembers) * 100, 1)
            : null;

        return [
            'members' => [
                'total' => Member::count(),
                'active' => Member::where('status', MemberStatus::ACTIVE)->count(),
                'pending' => Member::where('status', MemberStatus::PENDING)->count(),
                'suspended' => Member::where('status', MemberStatus::SUSPENDED)->count(),
                'new_this_month' => $thisMonthMembers,
                'growth_percent' => $memberGrowth,
            ],
            'payments' => [
                'total_this_month' => $thisMonthRevenue,
                'pending_count' => Payment::where('status', PaymentStatus::PENDING)->count(),
                'overdue_count' => Payment::where('status', PaymentStatus::PENDING)
                    ->where('due_date', '<', now())
                    ->count(),
                'collection_rate' => $collectionRate,
                'revenue_growth' => $revenueGrowth,
            ],
            'attendance' => [
                'today' => Attendance::whereDate('check_in_time', today())->count(),
                'this_month' => Attendance::whereMonth('check_in_time', now()->month)->count(),
                'this_week' => Attendance::whereBetween('check_in_time', [
                    now()->startOfWeek(), now()->endOfWeek(),
                ])->count(),
            ],
            'programs' => [
                'total' => Program::count(),
                'active' => Program::where('is_active', true)->count(),
            ],
            'coaches' => [
                'total' => Coach::count(),
                'active' => Coach::where('is_active', true)->count(),
            ],
        ];
    }

    /**
     * Member growth trend – last 12 months
     */
    public function memberGrowthTrend(): array
    {
        $trend = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $trend[] = [
                'month' => $month->format('M'),
                'year' => $month->format('Y'),
                'label' => $month->format('M \'y'),
                'new' => Member::whereYear('registration_date', $month->year)
                    ->whereMonth('registration_date', $month->month)
                    ->count(),
                'total' => Member::where(function ($q) use ($month) {
                    $q->whereYear('registration_date', '<=', $month->year);
                    $q->orWhere(function ($q2) use ($month) {
                        $q2->whereYear('registration_date', $month->year)
                            ->whereMonth('registration_date', '<=', $month->month);
                    });
                })->count(),
            ];
        }

        return $trend;
    }

    /**
     * Attendance by program – this month
     */
    public function attendanceByProgram(): array
    {
        return Program::withCount(['attendances' => function ($query) {
            $query->whereMonth('check_in_time', now()->month)
                ->whereYear('check_in_time', now()->year);
        }])
            ->get()
            ->map(fn ($p) => [
                'name' => $p->short_code ?? $p->name,
                'full_name' => $p->name,
                'count' => $p->attendances_count,
            ])
            ->filter(fn ($p) => $p['count'] > 0)
            ->sortByDesc('count')
            ->values()
            ->toArray();
    }

    /**
     * Top programs by revenue – last 6 months
     */
    public function topProgramsByRevenue(): array
    {
        $start = now()->subMonths(5)->startOfMonth();

        return Program::all()->map(function ($program) use ($start) {
            $revenue = Payment::where('status', PaymentStatus::VERIFIED)
                ->where('created_at', '>=', $start)
                ->whereHas('member.programs', fn ($q) => $q->where('programs.id', $program->id))
                ->sum('amount');

            return [
                'name' => $program->short_code ?? $program->name,
                'full_name' => $program->name,
                'revenue' => (float) $revenue,
            ];
        })
            ->filter(fn ($p) => $p['revenue'] > 0)
            ->sortByDesc('revenue')
            ->values()
            ->toArray();
    }

    /**
     * Coach workload summary
     */
    public function coachWorkload(): array
    {
        return Coach::active()
            ->with(['programClasses' => fn ($q) => $q->active()])
            ->withCount(['programs'])
            ->get()
            ->map(fn ($coach) => [
                'name' => $coach->name,
                'programs' => $coach->programs_count,
                'classes' => $coach->programClasses->count(),
                'specialization' => $coach->specialization,
            ])
            ->sortByDesc('classes')
            ->values()
            ->toArray();
    }

    /**
     * Payment breakdown by type – this month
     */
    public function paymentBreakdownThisMonth(): array
    {
        return Payment::where('status', PaymentStatus::VERIFIED)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->select('type', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
            ->groupBy('type')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->type->label(),
                'value' => (float) $item->total,
                'count' => $item->count,
            ])
            ->toArray();
    }
}
