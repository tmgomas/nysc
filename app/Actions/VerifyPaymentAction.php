<?php

namespace App\Actions;

use App\Models\Payment;
use App\Enums\PaymentStatus;
use Illuminate\Support\Facades\Auth;

class VerifyPaymentAction
{
    /**
     * Verify a payment
     */
    public function execute(Payment $payment): Payment
    {
        if ($payment->status !== PaymentStatus::PAID) {
            throw new \Exception('Only paid payments can be verified');
        }

        $payment->update([
            'status' => PaymentStatus::VERIFIED,
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        // Log the verification
        $payment->member->log('payment_verified', "Payment of Rs. {$payment->amount} verified by " . Auth::user()->name, [
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
            'type' => $payment->type->value,
        ]);

        return $payment->fresh();
    }

    /**
     * Reject a payment
     */
    public function reject(Payment $payment, string $reason): Payment
    {
        $payment->update([
            'status' => PaymentStatus::REJECTED,
            'notes' => $reason,
        ]);

        // Log the rejection
        $payment->member->log('payment_rejected', "Payment rejected by " . Auth::user()->name . ". Reason: {$reason}", [
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
        ]);

        return $payment->fresh();
    }
}
