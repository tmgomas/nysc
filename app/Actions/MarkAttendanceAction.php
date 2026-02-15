<?php

namespace App\Actions;

use App\Models\Member;
use App\Models\Attendance;
use App\Models\Program;
use App\Enums\AttendanceMethod;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class MarkAttendanceAction
{
    /**
     * Mark attendance for a member
     */
    public function execute(
        Member $member,
        Program $program,
        AttendanceMethod $method,
        ?Carbon $checkInTime = null,
        ?string $notes = null
    ): Attendance {
        // Verify member is enrolled in this sport
        if (!$member->isActivelyEnrolledIn($program->id)) {
            throw new \Exception('Member is not actively enrolled in this sport');
        }

        // Check if already checked in today
        $existingAttendance = Attendance::where('member_id', $member->id)
            ->where('program_id', $program->id)
            ->whereDate('check_in_time', today())
            ->first();

        if ($existingAttendance) {
            throw new \Exception('Member already checked in for this program today');
        }

        $attendance = Attendance::create([
            'member_id' => $member->id,
            'program_id' => $program->id,
            'check_in_time' => $checkInTime ?? now(),
            'marked_by' => Auth::id(),
            'method' => $method,
            'notes' => $notes,
        ]);

        // Log the attendance
        $member->log('attendance_marked', "Attendance marked for {$program->name}", [
            'attendance_id' => $attendance->id,
            'program' => $program->name,
            'method' => $method->value,
        ]);

        return $attendance;
    }

    /**
     * Mark check-out time
     */
    public function checkOut(Attendance $attendance, ?Carbon $checkOutTime = null): Attendance
    {
        if ($attendance->check_out_time) {
            throw new \Exception('Already checked out');
        }

        $attendance->update([
            'check_out_time' => $checkOutTime ?? now(),
        ]);

        return $attendance->fresh();
    }

    /**
     * Bulk mark attendance for multiple members
     */
    public function bulkMark(array $memberIds, Program $program, ?Carbon $checkInTime = null): array
    {
        $results = [
            'success' => [],
            'failed' => [],
        ];

        foreach ($memberIds as $memberId) {
            try {
                $member = Member::findOrFail($memberId);
                $attendance = $this->execute(
                    $member,
                    $program,
                    AttendanceMethod::BULK,
                    $checkInTime
                );
                $results['success'][] = [
                    'member_id' => $memberId,
                    'attendance_id' => $attendance->id,
                ];
            } catch (\Exception $e) {
                $results['failed'][] = [
                    'member_id' => $memberId,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}
