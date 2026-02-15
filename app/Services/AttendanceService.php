<?php

namespace App\Services;

use App\Models\{Member, Program, Attendance};
use App\Actions\{MarkAttendanceAction, GenerateQRCodeAction};
use App\Enums\AttendanceMethod;
use Carbon\Carbon;

class AttendanceService
{
    public function __construct(
        protected MarkAttendanceAction $markAttendance,
        protected GenerateQRCodeAction $generateQRCode
    ) {}

    /**
     * Mark attendance via QR code scan
     */
    public function markViaQRCode(string $qrData, Program $program): Attendance
    {
        $member = $this->generateQRCode->verify($qrData);

        if (!$member) {
            throw new \Exception('Invalid QR code');
        }

        return $this->markAttendance->execute(
            $member,
            $program,
            AttendanceMethod::QR_CODE
        );
    }

    /**
     * Mark attendance manually
     */
    public function markManually(Member $member, Program $program, ?string $notes = null): Attendance
    {
        return $this->markAttendance->execute(
            $member,
            $program,
            AttendanceMethod::MANUAL,
            null,
            $notes
        );
    }

    /**
     * Bulk mark attendance
     */
    public function bulkMark(array $memberIds, Program $program, ?Carbon $checkInTime = null): array
    {
        return $this->markAttendance->bulkMark($memberIds, $program, $checkInTime);
    }

    /**
     * Check out member
     */
    public function checkOut(Attendance $attendance): Attendance
    {
        return $this->markAttendance->checkOut($attendance);
    }

    /**
     * Get attendance statistics for member
     */
    public function getMemberStatistics(Member $member, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now()->endOfMonth();

        $attendances = $member->attendanceBetween($startDate, $endDate)->get();

        return [
            'total_count' => $attendances->count(),
            'by_program' => $attendances->groupBy('program_id')->map(function ($group) {
                return [
                    'program' => $group->first()->program->name,
                    'count' => $group->count(),
                ];
            })->values(),
            'by_method' => $attendances->groupBy('method')->map(function ($group, $method) {
                return [
                    'method' => $method,
                    'count' => $group->count(),
                ];
            })->values(),
            'average_duration' => $attendances->avg('duration_minutes'),
            'total_duration' => $attendances->sum('duration_minutes'),
        ];
    }

    /**
     * Get attendance statistics for program
     */
    public function getProgramStatistics(Program $program, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now()->endOfMonth();

        $attendances = $program->attendances()
            ->whereBetween('check_in_time', [$startDate, $endDate])
            ->get();

        return [
            'total_count' => $attendances->count(),
            'unique_members' => $attendances->pluck('member_id')->unique()->count(),
            'by_date' => $attendances->groupBy(function ($attendance) {
                return $attendance->check_in_time->format('Y-m-d');
            })->map(function ($group, $date) {
                return [
                    'date' => $date,
                    'count' => $group->count(),
                ];
            })->values(),
            'peak_day' => $attendances->groupBy(function ($attendance) {
                return $attendance->check_in_time->format('l');
            })->sortByDesc(function ($group) {
                return $group->count();
            })->keys()->first(),
        ];
    }

    /**
     * Get today's attendance for a program
     */
    public function getTodayAttendance(Program $program): array
    {
        $attendances = $program->attendances()
            ->whereDate('check_in_time', today())
            ->with('member')
            ->get();

        return [
            'count' => $attendances->count(),
            'members' => $attendances->map(function ($attendance) {
                return [
                    'member_number' => $attendance->member->member_number,
                    'member_name' => $attendance->member->user->name ?? 'N/A',
                    'check_in_time' => $attendance->check_in_time->format('H:i'),
                    'check_out_time' => $attendance->check_out_time?->format('H:i'),
                    'duration' => $attendance->duration_minutes,
                ];
            }),
        ];
    }
}
