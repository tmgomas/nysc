<?php

namespace App\Services;

use App\Models\{Member, Payment};
use App\Actions\{
    CalculateMembershipFeeAction,
    ProcessPaymentAction,
    GeneratePaymentScheduleAction
};
use App\Enums\{PaymentType, PaymentStatus};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PaymentService
{
    public function __construct(
        protected CalculateMembershipFeeAction $calculateFee,
        protected ProcessPaymentAction $processPayment,
        protected GeneratePaymentScheduleAction $generateSchedule
    ) {}

    /**
     * Calculate fees for member
     */
    public function calculateFees(Member $member, bool $includeAdmission = false): array
    {
        $sportIds = $member->activeSports()->pluck('id')->toArray();
        return $this->calculateFee->execute($sportIds, $includeAdmission);
    }

    /**
     * Process admission payment
     */
    public function processAdmissionPayment(
        Member $member,
        string $paymentMethod,
        ?string $receiptUrl = null,
        ?string $referenceNumber = null
    ): Payment {
        $fees = $this->calculateFees($member, true);

        return $this->processPayment->execute(
            $member,
            PaymentType::ADMISSION,
            $fees['admission_total'],
            $paymentMethod,
            null,
            1,
            $receiptUrl,
            $referenceNumber
        );
    }

    /**
     * Process monthly payment
     */
    public function processMonthlyPayment(
        Member $member,
        string $monthYear,
        string $paymentMethod,
        ?string $receiptUrl = null,
        ?string $referenceNumber = null
    ): Payment {
        $fees = $this->calculateFees($member);

        return $this->processPayment->execute(
            $member,
            PaymentType::MONTHLY,
            $fees['monthly_total'],
            $paymentMethod,
            $monthYear,
            1,
            $receiptUrl,
            $referenceNumber
        );
    }

    /**
     * Process bulk payment (multiple months)
     */
    public function processBulkPayment(
        Member $member,
        int $months,
        string $startMonthYear,
        string $paymentMethod,
        ?string $receiptUrl = null,
        ?string $referenceNumber = null
    ): Payment {
        $sportIds = $member->activeSports()->pluck('id')->toArray();
        $bulkFees = $this->calculateFee->calculateBulkPayment($sportIds, $months);

        return $this->processPayment->execute(
            $member,
            PaymentType::BULK,
            $bulkFees['bulk_total'],
            $paymentMethod,
            $startMonthYear,
            $months,
            $receiptUrl,
            $referenceNumber
        );
    }

    /**
     * Verify payment
     */
    public function verifyPayment(Payment $payment): Payment
    {
        if ($payment->status !== PaymentStatus::PAID) {
            throw new \Exception('Only paid payments can be verified');
        }

        $payment->update([
            'status' => PaymentStatus::VERIFIED,
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        $payment->member->log('payment_verified', "Payment verified by " . Auth::user()->name, [
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
        ]);

        return $payment->fresh();
    }

    /**
     * Reject payment
     */
    public function rejectPayment(Payment $payment, string $reason): Payment
    {
        $payment->update([
            'status' => PaymentStatus::REJECTED,
            'notes' => $reason,
        ]);

        $payment->member->log('payment_rejected', "Payment rejected. Reason: {$reason}", [
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
        ]);

        return $payment->fresh();
    }

    /**
     * Get payment summary for member
     */
    public function getPaymentSummary(Member $member): array
    {
        return [
            'total_paid' => $member->total_paid,
            'total_pending' => $member->total_pending,
            'overdue_count' => $member->overduePayments()->count(),
            'overdue_amount' => $member->overduePayments()->sum('amount'),
            'last_payment' => $member->last_payment,
            'next_due' => $member->next_due_payment,
            'payment_history' => $member->payments()
                ->latest('paid_date')
                ->limit(10)
                ->get(),
        ];
    }
}
