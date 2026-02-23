<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Services\ScheduleService;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct(
        protected ScheduleService $scheduleService
    ) {}

    /**
     * GET /api/member/schedule?days=30
     *
     * Returns upcoming class schedule for the authenticated member,
     * grouped by date and filtered for holidays & cancellations.
     *
     * Query params:
     *   days (int, 1-90, default 30) – how many days ahead to look
     */
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $days = (int) $request->get('days', 30);
        $days = max(1, min(90, $days)); // clamp between 1 and 90

        $schedule = $this->scheduleService->getUpcomingSchedule($member, $days);

        return response()->json($schedule);
    }
}
