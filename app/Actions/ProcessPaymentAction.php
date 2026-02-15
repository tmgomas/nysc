<?php

namespace App\Actions;

use App\Models\Member;
use App\Models\Payment;
use App\Models\MemberPaymentSchedule;
use App\Enums\{PaymentType, PaymentStatus, ScheduleStatus, MemberStatus};
use App\Exceptions\Payment\InvalidPaymentAmountException;
use App\Exceptions\Payment\PaymentNotFoundException;
use App\Exceptions\Member\InvalidMemberStatusException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessPaymentAction
{
    /**
     * Process a payment and update related schedules
     * 
     * @param Member $member The member making the payment
     * @param PaymentType $type Type of payment (monthly, bulk, admission)
     * @param float $amount Payment amount
     * @param string $paymentMethod Payment method (cash, bank_transfer, online)
     * @param string|null $monthYear Month-year for the payment (Y-m format)
     * @param int $monthsCount Number of months for bulk payment
     * @param string|null $receiptUrl URL to payment receipt
     * @param string|null $referenceNumber Payment reference number
     * @param string|null $programId Program ID if payment is for specific program
     * @return Payment The created payment record
     * 
     * @throws InvalidPaymentAmountException If payment amount is invalid
     * @throws InvalidMemberStatusException If member status doesn't allow payments
     * @throws PaymentNotFoundException If payment schedule not found
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
        ?string $programId = null
    ): Payment {
        // Validate payment amount
        $this->validateAmount($amount);
        
        // Validate member status
        $this->validateMemberStatus($member);

        // Wrap in database transaction for data integrity
        return DB::transaction(function () use (
            $member, $type, $amount, $paymentMethod, 
            $monthYear, $monthsCount, $receiptUrl, 
            $referenceNumber, $programId
        ) {
            try {
                $dueDate = $monthYear 
                    ? Carbon::createFromFormat('Y-m', $monthYear)->endOfMonth()
                    : now();

                // Generate reference number if not provided
                if (!$referenceNumber) {
                    $referenceGenerator = new GeneratePaymentReferenceAction();
                    $referenceNumber = $programId 
                        ? $referenceGenerator->execute($programId, $dueDate)
                        : $referenceGenerator->executeForMultiplePrograms($dueDate);
                }

                // Generate receipt number
                $receiptGenerator = new GenerateReceiptNumberAction();
                $receiptNumber = $receiptGenerator->execute(now());

                // Create payment record
                $payment = Payment::create([
                    'member_id' => $member->id,
                    'program_id' => $programId,
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
                    'receipt_number' => $receiptNumber,
                ]);

                // Update payment schedules if monthly or bulk payment
                if ($type === PaymentType::MONTHLY || $type === PaymentType::BULK) {
                    $this->updateSchedules($member, $payment, $monthYear, $monthsCount, $programId);
                }

                // Log the payment
                $this->logPayment($member, $payment, $type, $amount, $programId);

                // Log success
                Log::info('Payment processed successfully', [
                    'payment_id' => $payment->id,
                    'member_id' => $member->id,
                    'amount' => $amount,
                    'type' => $type->value,
                ]);

                return $payment;

            } catch (\Exception $e) {
                // Log error
                Log::error('Payment processing failed', [
                    'member_id' => $member->id,
                    'amount' => $amount,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                throw $e;
            }
        });
    }

    /**
     * Validate payment amount
     * 
     * @throws InvalidPaymentAmountException
     */
    protected function validateAmount(float $amount): void
    {
        if ($amount < 0) {
            throw InvalidPaymentAmountException::negative($amount);
        }

        if ($amount === 0.0) {
            throw InvalidPaymentAmountException::zero();
        }

        // Optional: Add maximum amount validation
        $maxAmount = 100000; // Rs. 100,000
        if ($amount > $maxAmount) {
            throw InvalidPaymentAmountException::exceedsMaximum($amount, $maxAmount);
        }
    }

    /**
     * Validate member status allows payments
     * 
     * @throws InvalidMemberStatusException
     */
    protected function validateMemberStatus(Member $member): void
    {
        if ($member->status === MemberStatus::SUSPENDED) {
            throw InvalidMemberStatusException::suspended($member);
        }

        if ($member->status === MemberStatus::INACTIVE) {
            throw InvalidMemberStatusException::inactive($member);
        }
    }

    /**
     * Update payment schedules after payment
     * 
     * @throws PaymentNotFoundException If schedule not found
     */
    protected function updateSchedules(
        Member $member, 
        Payment $payment, 
        ?string $startMonthYear, 
        int $monthsCount, 
        ?string $programId = null
    ): void {
        $startDate = $startMonthYear 
            ? Carbon::createFromFormat('Y-m', $startMonthYear)
            : now();

        for ($i = 0; $i < $monthsCount; $i++) {
            $monthYear = $startDate->copy()->addMonths($i)->format('Y-m');

            $query = MemberPaymentSchedule::where('member_id', $member->id)
                ->where('month_year', $monthYear);

            if ($programId) {
                $query->where('program_id', $programId);
            }

            $affectedRows = $query->update([
                'status' => ScheduleStatus::PAID,
                'payment_id' => $payment->id,
            ]);

            // Log warning if no schedules were updated
            if ($affectedRows === 0) {
                Log::warning('No payment schedule found to update', [
                    'member_id' => $member->id,
                    'month_year' => $monthYear,
                    'program_id' => $programId,
                ]);
            }
        }
    }

    /**
     * Log payment activity
     */
    protected function logPayment(
        Member $member, 
        Payment $payment, 
        PaymentType $type, 
        float $amount, 
        ?string $programId
    ): void {
        $member->log('payment_received', "Payment of Rs. {$amount} received", [
            'payment_id' => $payment->id,
            'type' => $type->value,
            'amount' => $amount,
            'program_id' => $programId,
            'payment_method' => $payment->payment_method,
            'reference_number' => $payment->reference_number,
        ]);
    }
}
