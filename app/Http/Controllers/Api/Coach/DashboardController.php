<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $coach = $request->user()->coach;

        if (! $coach) {
            return response()->json(['message' => 'Coach profile not found.'], 404);
        }

        $programIds = $coach->programs()->pluck('programs.id');

        $todayAttendanceCount = Attendance::whereIn('program_id', $programIds)
            ->whereDate('check_in_time', today())
            ->count();

        $programs = Program::whereIn('id', $programIds)
            ->withCount(['members' => fn ($q) => $q->where('member_programs.status', 'active')])
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'short_code' => $p->short_code,
                'active_members_count' => $p->members_count,
            ]);

        return response()->json([
            'today_attendance_count' => $todayAttendanceCount,
            'programs' => $programs,
        ]);
    }

    public function today(Request $request)
    {
        $coach = $request->user()->coach;

        if (! $coach) {
            return response()->json(['message' => 'Coach profile not found.'], 404);
        }

        $programIds = $coach->programs()->pluck('programs.id');
        $todayName = strtolower(now()->format('l'));

        $classes = \App\Models\ProgramClass::whereIn('program_id', $programIds)
            ->where('is_active', true)
            ->where('day_of_week', $todayName)
            ->with('program')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'program_name' => $c->program->name,
                'start_time' => $c->start_time,
                'end_time' => $c->end_time,
            ]);

        return response()->json([
            'classes' => $classes,
        ]);
    }
}
