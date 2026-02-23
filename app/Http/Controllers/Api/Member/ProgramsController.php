<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Services\ScheduleService;
use Illuminate\Http\Request;

class ProgramsController extends Controller
{
    public function __construct(
        protected ScheduleService $scheduleService
    ) {}

    /**
     * GET /api/member/programs
     * Returns the member's enrolled programs with their assigned class slots.
     */
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $programs = $this->scheduleService->getMemberPrograms($member);

        return response()->json([
            'programs' => $programs,
            'total'    => count($programs),
        ]);
    }
}
