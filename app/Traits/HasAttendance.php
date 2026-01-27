<?php

namespace App\Traits;

use App\Models\Attendance;
use App\Models\Sport;
use Carbon\Carbon;

trait HasAttendance
{
    /**
     * Get all attendance records
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'member_id');
    }

    /**
     * Get today's attendance
     */
    public function todayAttendance()
    {
        return $this->attendances()->whereDate('check_in_time', today());
    }

    /**
     * Get attendance for a specific sport
     */
    public function attendanceForSport($sportId)
    {
        return $this->attendances()->where('sport_id', $sportId);
    }

    /**
     * Get attendance for current month
     */
    public function monthlyAttendance()
    {
        return $this->attendances()
            ->whereYear('check_in_time', now()->year)
            ->whereMonth('check_in_time', now()->month);
    }

    /**
     * Get attendance count for current month
     */
    public function getMonthlyAttendanceCountAttribute()
    {
        return $this->monthlyAttendance()->count();
    }

    /**
     * Get total attendance count
     */
    public function getTotalAttendanceCountAttribute()
    {
        return $this->attendances()->count();
    }

    /**
     * Check if checked in today
     */
    public function isCheckedInToday(): bool
    {
        return $this->todayAttendance()->exists();
    }

    /**
     * Get last attendance
     */
    public function getLastAttendanceAttribute()
    {
        return $this->attendances()->latest('check_in_time')->first();
    }

    /**
     * Get attendance for date range
     */
    public function attendanceBetween(Carbon $startDate, Carbon $endDate)
    {
        return $this->attendances()
            ->whereBetween('check_in_time', [$startDate, $endDate]);
    }

    /**
     * Get attendance count for specific sport
     */
    public function attendanceCountForSport($sportId): int
    {
        return $this->attendanceForSport($sportId)->count();
    }

    /**
     * Get average attendance per month
     */
    public function getAverageMonthlyAttendanceAttribute()
    {
        $firstAttendance = $this->attendances()->oldest('check_in_time')->first();
        
        if (!$firstAttendance) {
            return 0;
        }

        $monthsSinceFirst = $firstAttendance->check_in_time->diffInMonths(now()) + 1;
        $totalAttendance = $this->total_attendance_count;

        return round($totalAttendance / $monthsSinceFirst, 2);
    }

    /**
     * Get most attended sport
     */
    public function getMostAttendedSportAttribute()
    {
        return Sport::whereHas('attendances', function ($query) {
            $query->where('member_id', $this->id);
        })
        ->withCount(['attendances' => function ($query) {
            $query->where('member_id', $this->id);
        }])
        ->orderByDesc('attendances_count')
        ->first();
    }
}
