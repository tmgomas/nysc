<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Member, Payment};
use App\Services\PaymentService;
use App\Enums\{PaymentType, PaymentMethod};
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    public function index(Request $request)
    {
        $payments = Payment::with(['member.user'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['status', 'type']),
        ]);
    }

    public function show(Payment $payment)
    {
        $payment->load(['member.user', 'member.programs']);

        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'program_id' => 'nullable|exists:programs,id',
            'type' => 'required|in:admission,monthly,bulk',
            'payment_method' => 'required|in:cash,bank_transfer,online',
            'month_year' => 'nullable|string',
            'months_count' => 'nullable|integer|min:1',
            'receipt_url' => 'nullable|url',
            'reference_number' => 'nullable|string',
        ]);

        $member = Member::findOrFail($validated['member_id']);
        $type = PaymentType::from($validated['type']);
        $method = PaymentMethod::from($validated['payment_method']);

        $payment = match($type) {
            PaymentType::ADMISSION => $this->paymentService->processAdmissionPayment(
                $member,
                $method->value,
                $validated['receipt_url'] ?? null,
                $validated['reference_number'] ?? null
            ),
            PaymentType::MONTHLY => $this->paymentService->processMonthlyPayment(
                $member,
                $validated['month_year'],
                $method->value,
                $validated['receipt_url'] ?? null,
                $validated['reference_number'] ?? null,
                $validated['program_id'] ?? null
            ),
            PaymentType::BULK => $this->paymentService->processBulkPayment(
                $member,
                $validated['months_count'],
                $validated['month_year'],
                $method->value,
                $validated['receipt_url'] ?? null,
                $validated['reference_number'] ?? null
            ),
        };

        return redirect()->back()
            ->with('success', 'Payment processed successfully');
    }

    public function verify(Payment $payment)
    {
        $this->paymentService->verifyPayment($payment);

        return redirect()->back()
            ->with('success', 'Payment verified');
    }

    public function reject(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $this->paymentService->rejectPayment($payment, $validated['reason']);

        return redirect()->back()
            ->with('success', 'Payment rejected');
    }

    public function markAsPaid(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,bank_transfer,online',
            'reference_number' => 'nullable|string',
        ]);

        if ($payment->status !== \App\Enums\PaymentStatus::PENDING) {
            return redirect()->back()->with('error', 'Payment is not pending');
        }

        // Use the new action to handle payment items and schedules
        $markAsPaid = new \App\Actions\MarkPaymentAsPaidAction();
        $markAsPaid->execute(
            $payment,
            $validated['payment_method'],
            $validated['reference_number'] ?? null
        );

        return redirect()->back()
            ->with('success', 'Payment marked as received');
    }

    public function bulkSchedulePayment(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'schedule_ids' => 'required|array|min:1',
            'schedule_ids.*' => 'required|exists:member_payment_schedules,id',
            'payment_method' => 'required|in:cash,bank_transfer,online',
        ]);

        $member = Member::findOrFail($validated['member_id']);
        $method = PaymentMethod::from($validated['payment_method']);

        // Process all schedules in a transaction
        $processedCount = 0;
        
        \DB::transaction(function () use ($member, $validated, $method, &$processedCount) {
            foreach ($validated['schedule_ids'] as $scheduleId) {
                $schedule = \App\Models\MemberPaymentSchedule::where('id', $scheduleId)
                    ->where('member_id', $member->id)
                    ->where('status', 'pending')
                    ->first();
                
                if ($schedule) {
                    // Process the payment for this specific schedule
                    $this->paymentService->processMonthlyPayment(
                        $member,
                        $schedule->month_year,
                        $method->value,
                        null,
                        null,
                        $schedule->program_id
                    );
                    $processedCount++;
                }
            }
        });

        if ($processedCount === 0) {
            return redirect()->back()->with('error', 'No pending schedules were found to process.');
        }

        return redirect()->back()
            ->with('success', "Successfully processed {$processedCount} payment" . ($processedCount !== 1 ? 's' : ''));
    }
}
