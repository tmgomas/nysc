<?php

namespace App\Services;

use App\Models\{Member, Payment, Attendance, Program};
use App\Enums\{MemberStatus, PaymentStatus};
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
        return [
            'members' => [
                'total' => Member::count(),
                'active' => Member::where('status', MemberStatus::ACTIVE)->count(),
                'pending' => Member::where('status', MemberStatus::PENDING)->count(),
                'new_this_month' => Member::whereMonth('registration_date', now()->month)->count(),
            ],
            'payments' => [
                'total_this_month' => Payment::whereMonth('created_at', now()->month)->sum('amount'),
                'pending_count' => Payment::where('status', PaymentStatus::PENDING)->count(),
                'overdue_count' => Payment::where('status', PaymentStatus::PENDING)
                    ->where('due_date', '<', now())
                    ->count(),
            ],
            'attendance' => [
                'today' => Attendance::whereDate('check_in_time', today())->count(),
                'this_month' => Attendance::whereMonth('check_in_time', now()->month)->count(),
            ],
            'programs' => [
                'total' => Program::count(),
                'active' => Program::where('is_active', true)->count(),
            ],
        ];
    }
}
