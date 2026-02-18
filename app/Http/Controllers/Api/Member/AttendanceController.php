<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\AttendanceResource;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $attendances = $member->attendances()
            ->with('program')
            ->orderByDesc('check_in_time')
            ->paginate(20);

        return AttendanceResource::collection($attendances);
    }
}
