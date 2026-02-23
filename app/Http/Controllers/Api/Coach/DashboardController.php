<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function __construct(
        protected \App\Services\CoachService $coachService
    ) {}

    public function index(Request $request)
    {
        $coach = $request->user()->coach;

        if (! $coach) {
            return response()->json(['message' => 'Coach profile not found.'], 404);
        }

        $data = $this->coachService->getDashboardData($coach);

        return response()->json($data);
    }

    public function today(Request $request)
    {
        $coach = $request->user()->coach;

        if (! $coach) {
            return response()->json(['message' => 'Coach profile not found.'], 404);
        }

        $data = $this->coachService->getTodayClasses($coach);

        return response()->json($data);
    }
}
