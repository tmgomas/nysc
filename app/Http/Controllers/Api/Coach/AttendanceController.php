<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\AttendanceResource;
use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function __construct(
        protected \App\Services\AttendanceService $attendanceService
    ) {}

    public function index(Request $request)
    {
        $coach = $request->user()->coach;

        if (! $coach) {
            return response()->json(['message' => 'Coach profile not found.'], 404);
        }

        $attendances = $this->attendanceService->getCoachAttendanceHistory($coach, $request->get('date'));

        return AttendanceResource::collection($attendances);
    }

    public function mark(Request $request)
    {
        $coach = $request->user()->coach;

        if (! $coach) {
            return response()->json(['message' => 'Coach profile not found.'], 404);
        }

        $validated = $request->validate([
            'member_id' => 'required|uuid|exists:members,id',
            'program_id' => 'required|uuid|exists:programs,id',
            'method' => 'sometimes|string|in:manual,qr_code,nfc,rfid',
        ]);

        try {
            $member = Member::findOrFail($validated['member_id']);
            $program = \App\Models\Program::findOrFail($validated['program_id']);

            $attendance = $this->attendanceService->toggleCoachAttendance(
                $member,
                $program,
                $request->user()->id,
                $validated['method'] ?? 'manual'
            );

            $isCheckOut = !is_null($attendance->check_out_time);

            return response()->json([
                'message' => $isCheckOut ? 'Member checked out successfully.' : 'Member checked in successfully.',
                'attendance' => new AttendanceResource($attendance->load(['member', 'program'])),
            ], $isCheckOut ? 200 : 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
