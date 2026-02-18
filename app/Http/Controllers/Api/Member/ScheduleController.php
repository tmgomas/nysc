<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\ProgramResource;
use App\Models\ProgramClass;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $programIds = $member->programs()->pluck('programs.id');

        $classes = ProgramClass::whereIn('program_id', $programIds)
            ->where('is_active', true)
            ->with(['program.location'])
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'program' => [
                        'id' => $class->program->id,
                        'name' => $class->program->name,
                        'short_code' => $class->program->short_code,
                    ],
                    'day_of_week' => $class->day_of_week,
                    'start_time' => $class->start_time,
                    'end_time' => $class->end_time,
                    'location' => $class->program->location ? [
                        'id' => $class->program->location->id,
                        'name' => $class->program->location->name,
                    ] : null,
                ];
            });

        return response()->json([
            'schedule' => $classes,
        ]);
    }
}
