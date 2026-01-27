<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function index()
    {
        $stats = $this->reportService->dashboardStats();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
