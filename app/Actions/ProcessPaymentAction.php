<?php

namespace App\Actions;

use App\Models\Member;
use App\Models\Payment;
use App\Models\MemberPaymentSchedule;
use App\Enums\{PaymentType, PaymentStatus, ScheduleStatus};
use Carbon\Carbon;

class ProcessPaymentAction
{
    /**
     * Process a payment and update related schedules
     */
    public function execute(
        Member $member,
        PaymentType $type,
        float $amount,
        string $paymentMethod,
        ?string $monthYear = null,
        int $monthsCount = 1,
        ?string $receiptUrl = null,
        ?string $referenceNumber = null,
        ?string $sportId = null
    ): Payment {
        $dueDate = $monthYear 
            ? Carbon::createFromFormat('Y-m', $monthYear)->endOfMonth()
            : now();

        $payment = Payment::create([
            'member_id' => $member->id,
            'sport_id' => $sportId,
            'type' => $type,
            'amount' => $amount,
            'month_year' => $monthYear,
            'months_count' => $monthsCount,
            'status' => PaymentStatus::PAID,
            'due_date' => $dueDate,
            'paid_date' => now(),
            'payment_method' => $paymentMethod,
            'receipt_url' => $receiptUrl,
            'reference_number' => $referenceNumber,
        ]);

        // Update payment schedules if monthly or bulk payment
        if ($type === PaymentType::MONTHLY || $type === PaymentType::BULK) {
            $this->updateSchedules($member, $payment, $monthYear, $monthsCount, $sportId);
        }

        // Log the payment
        $member->log('payment_received', "Payment of Rs. {$amount} received", [
            'payment_id' => $payment->id,
            'type' => $type->value,
            'amount' => $amount,
            'sport_id' => $sportId,
        ]);

        return $payment;
    }

    /**
     * Update payment schedules after payment
     */
    protected function updateSchedules(Member $member, Payment $payment, ?string $startMonthYear, int $monthsCount, ?string $sportId = null): void
    {
        $startDate = $startMonthYear 
            ? Carbon::createFromFormat('Y-m', $startMonthYear)
            : now();

        for ($i = 0; $i < $monthsCount; $i++) {
            $monthYear = $startDate->copy()->addMonths($i)->format('Y-m');

            $query = [
                'member_id' => $member->id,
                'month_year' => $monthYear,
            ];

            if ($sportId) {
                $query['sport_id'] = $sportId;
            }

            MemberPaymentSchedule::updateOrCreate(
                $query,
                [
                    'status' => ScheduleStatus::PAID,
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount, // Optional: Update amount if it differs? Maybe not.
                ]
            );
        }
    }
}
