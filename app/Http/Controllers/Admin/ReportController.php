<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{

    public function members()
    {
        // 1. Status Breakdown
        $statusStats = \App\Models\Member::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // 2. Members per Sport
        $sportStats = \App\Models\Sport::withCount(['members' => function($q) {
            $q->where('member_sports.status', 'active');
        }])
        ->get()
        ->map(fn($sport) => [
            'name' => $sport->name,
            'count' => $sport->members_count
        ]);

        // 3. Registration Trend (Last 6 Months)
        $isSqlite = \DB::connection()->getDriverName() === 'sqlite';
        $dateFormat = $isSqlite ? "strftime('%Y-%m', registration_date)" : "DATE_FORMAT(registration_date, '%Y-%m')";

        $registrationTrend = \App\Models\Member::selectRaw("$dateFormat as month, count(*) as count")
            ->where('registration_date', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return \Inertia\Inertia::render('Admin/Reports/Members', [
            'statusStats' => $statusStats,
            'sportStats' => $sportStats,
            'registrationTrend' => $registrationTrend,
            'totalMembers' => \App\Models\Member::count(),
            'newMembersThisMonth' => \App\Models\Member::whereMonth('registration_date', now()->month)->count(),
        ]);
    }

    public function payments(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        $payments = \App\Models\Payment::with(['member.user', 'verifiedBy'])
            ->whereBetween('paid_date', [$startDate, $endDate])
            ->latest('paid_date')
            ->paginate(20)
            ->withQueryString();

        $summary = [
            'total_collected' => \App\Models\Payment::whereBetween('paid_date', [$startDate, $endDate])->where('status', 'verified')->sum('amount'),
            'pending_verification' => \App\Models\Payment::where('status', 'pending')->count(),
        ];

        return \Inertia\Inertia::render('Admin/Reports/Payments', [
            'payments' => $payments,
            'summary' => $summary,
            'filters' => ['start_date' => $startDate, 'end_date' => $endDate]
        ]);
    }

    public function attendance(Request $request)
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        $attendanceBySport = \App\Models\Attendance::whereDate('check_in_time', $date)
            ->selectRaw('sport_id, count(*) as count')
            ->groupBy('sport_id')
            ->with('sport:id,name')
            ->get()
            ->map(fn($item) => [
                'sport' => $item->sport->name,
                'count' => $item->count
            ]);

        $hourlyTraffic = \App\Models\Attendance::whereDate('check_in_time', $date)
            ->selectRaw('HOUR(check_in_time) as hour, count(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return \Inertia\Inertia::render('Admin/Reports/Attendance', [
            'attendanceBySport' => $attendanceBySport,
            'hourlyTraffic' => $hourlyTraffic,
            'date' => $date,
            'totalToday' => \App\Models\Attendance::whereDate('check_in_time', $date)->count()
        ]);
    }

    public function revenue()
    {
        $isSqlite = \DB::connection()->getDriverName() === 'sqlite';
        $dateFormat = $isSqlite ? "strftime('%Y-%m', paid_date)" : "DATE_FORMAT(paid_date, '%Y-%m')";

        // Monthly Revenue for current year
        $monthlyRevenue = \App\Models\Payment::selectRaw("$dateFormat as month, sum(amount) as total")
            ->whereYear('paid_date', now()->year)
            ->where('status', 'verified')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Outstanding Payments (Overdue Schedules)
        $outstandingAmount = \App\Models\MemberPaymentSchedule::where('status', 'overdue')->sum('amount');
        $outstandingCount = \App\Models\MemberPaymentSchedule::where('status', 'overdue')->distinct('member_id')->count();

        return \Inertia\Inertia::render('Admin/Reports/Revenue', [
            'monthlyRevenue' => $monthlyRevenue,
            'outstanding' => [
                'amount' => $outstandingAmount,
                'member_count' => $outstandingCount
            ],
            'currentYear' => now()->year
        ]);
    }
}
