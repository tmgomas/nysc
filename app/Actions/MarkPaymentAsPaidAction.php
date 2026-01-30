<?php

namespace App\Actions;

use App\Models\{Payment, MemberPaymentSchedule};
use App\Enums\{PaymentStatus, ScheduleStatus};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MarkPaymentAsPaidAction
{
    /**
     * Mark a pending payment as paid and update related schedules
     * 
     * @param Payment $payment The pending payment to mark as paid
     * @param string $paymentMethod Payment method used
     * @param string|null $referenceNumber Optional reference number
     * @return Payment The updated payment
     */
    public function execute(
        Payment $payment,
        string $paymentMethod,
        ?string $referenceNumber = null
    ): Payment {
        if ($payment->status !== PaymentStatus::PENDING) {
            throw new \Exception('Only pending payments can be marked as paid');
        }

        return DB::transaction(function () use ($payment, $paymentMethod, $referenceNumber) {
            // Load payment items if not loaded
            if (!$payment->relationLoaded('items')) {
                $payment->load('items.sport');
            }

            // Generate reference number if not provided
            if (!$referenceNumber) {
                $referenceGenerator = new GeneratePaymentReferenceAction();
                
                // If payment has multiple sports, use multi-sport reference
                $sportIds = $payment->items->pluck('sport_id')->unique()->filter();
                if ($sportIds->count() > 1) {
                    $referenceNumber = $referenceGenerator->executeForMultipleSports(now());
                } elseif ($sportIds->count() === 1) {
                    $referenceNumber = $referenceGenerator->execute($sportIds->first(), now());
                }
            }

            // Update payment status to PAID (not verified yet)
            $payment->update([
                'status' => PaymentStatus::PAID,
                'paid_date' => now(),
                'payment_method' => $paymentMethod,
                'reference_number' => $referenceNumber,
            ]);

            // Update payment schedules for monthly fee items
            foreach ($payment->items as $item) {
                if ($item->type->value === 'monthly' && $item->month_year) {
                    // Find and update the corresponding schedule
                    $schedule = MemberPaymentSchedule::where('member_id', $payment->member_id)
                        ->where('sport_id', $item->sport_id)
                        ->where('month_year', $item->month_year)
                        ->first();

                    if ($schedule) {
                        $schedule->update([
                            'status' => ScheduleStatus::PAID,
                            'payment_id' => $payment->id,
                        ]);
                    } else {
                        // Create schedule if it doesn't exist
                        MemberPaymentSchedule::create([
                            'member_id' => $payment->member_id,
                            'sport_id' => $item->sport_id,
                            'month_year' => $item->month_year,
                            'amount' => $item->amount,
                            'status' => ScheduleStatus::PAID,
                            'due_date' => $payment->due_date,
                            'payment_id' => $payment->id,
                        ]);
                    }
                }
            }

            // Log the payment
            $payment->member->log('payment_received', "Payment marked as paid: {$payment->receipt_number}", [
                'payment_id' => $payment->id,
                'amount' => $payment->amount,
                'payment_method' => $paymentMethod,
                'reference_number' => $referenceNumber,
                'items_count' => $payment->items->count(),
            ]);

            return $payment->fresh(['items.sport', 'member']);
        });
    }
}
