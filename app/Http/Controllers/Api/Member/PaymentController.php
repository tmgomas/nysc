<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PaymentResource;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        protected \App\Services\PaymentService $paymentService
    ) {}

    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        // Fetch paid/history payments
        $payments = $this->paymentService->getMemberPayments($member, 100);
        $formattedPayments = PaymentResource::collection($payments)->response()->getData(true)['data'] ?? [];

        // Fetch pending schedules
        $schedules = $member->paymentSchedules()
            ->with('program')
            ->where('status', 'pending')
            ->orderBy('due_date')
            ->get();

        $formattedSchedules = $schedules->map(function ($schedule) {
            $monthName = null;
            $title = 'Monthly Fee';
            if ($schedule->month_year) {
                try {
                    $date = \Carbon\Carbon::createFromFormat('Y-m', $schedule->month_year);
                    $monthName = $date->format('F');
                    $title = $monthName . ' Monthly Fee';
                } catch (\Exception $e) {}
            }

            return [
                'id' => $schedule->id,
                'type' => 'monthly',
                'title' => $title,
                'amount' => $schedule->amount,
                'month_year' => $schedule->month_year,
                'month_name' => $monthName,
                'status' => 'pending', 
                'due_date' => $schedule->due_date?->format('Y-m-d'),
                'paid_date' => null,
                'payment_method' => null,
                'reference_number' => null,
                'receipt_number' => null,
                'is_overdue' => $schedule->due_date && $schedule->due_date < now(),
                'program' => $schedule->program ? [
                    'id' => $schedule->program->id,
                    'name' => $schedule->program->name,
                ] : null,
                'items' => [],
            ];
        })->toArray();

        return response()->json([
            'data' => array_merge($formattedSchedules, $formattedPayments),
        ]);
    }
}
