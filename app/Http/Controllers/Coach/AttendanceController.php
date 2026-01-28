<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index()
    {
        return Inertia::render('Coach/Attendance/Index');
    }

    public function mark(Request $request)
    {
        // Implementation for marking attendance
    }
}
