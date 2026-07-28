<?php

namespace App\Http\Controllers\Api\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
