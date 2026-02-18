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
    public function index(Request $request)
    {
        $coach = $request->user()->coach;

        if (! $coach) {
            return response()->json(['message' => 'Coach profile not found.'], 404);
        }

        $programIds = $coach->programs()->pluck('programs.id');

        $attendances = Attendance::whereIn('program_id', $programIds)
            ->whereDate('check_in_time', $request->get('date', today()))
            ->with(['member', 'program'])
            ->orderByDesc('check_in_time')
            ->get();

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

        // Check if member is enrolled in this program
        $member = Member::find($validated['member_id']);
        $isEnrolled = $member->programs()
            ->where('programs.id', $validated['program_id'])
            ->where('member_programs.status', 'active')
            ->exists();

        if (! $isEnrolled) {
            return response()->json([
                'message' => 'Member is not enrolled in this program.',
            ], 422);
        }

        // Check if already checked in today for this program
        $existingToday = Attendance::where('member_id', $validated['member_id'])
            ->where('program_id', $validated['program_id'])
            ->whereDate('check_in_time', today())
            ->whereNull('check_out_time')
            ->first();

        if ($existingToday) {
            // Check out instead
            $existingToday->check_out_time = now();
            $existingToday->save();

            return response()->json([
                'message' => 'Member checked out successfully.',
                'attendance' => new AttendanceResource($existingToday->load(['member', 'program'])),
            ]);
        }

        // Create new check-in
        $attendance = Attendance::create([
            'member_id' => $validated['member_id'],
            'program_id' => $validated['program_id'],
            'check_in_time' => now(),
            'marked_by' => $request->user()->id,
            'method' => $validated['method'] ?? 'manual',
        ]);

        return response()->json([
            'message' => 'Member checked in successfully.',
            'attendance' => new AttendanceResource($attendance->load(['member', 'program'])),
        ], 201);
    }
}
