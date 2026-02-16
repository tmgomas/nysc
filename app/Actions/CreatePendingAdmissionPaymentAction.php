<?php

namespace App\Actions;

use App\Models\{Member, Payment, PaymentItem};
use App\Enums\{PaymentType, PaymentStatus};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CreatePendingAdmissionPaymentAction
{
    /**
     * Create pending admission payment with line items for member's enrolled sports
     * 
     * @param Member $member The approved member
     * @return Payment The created pending payment
     */
    public function execute(Member $member): Payment
    {
        if (!$member->relationLoaded('programs')) {
            $member->load('programs');
        }

        $enrolledPrograms = $member->programs->where('pivot.status', 'active');

        if ($enrolledPrograms->isEmpty()) {
            throw new \Exception('Member must have at least one active program to create admission payment.');
        }

        return DB::transaction(function () use ($member, $enrolledPrograms) {
            // Calculate total amount
            $totalAmount = 0;
            $currentMonth = now()->format('Y-m');

            // Calculate admission fees + first month fees
            foreach ($enrolledPrograms as $program) {
                $totalAmount += $program->admission_fee + $program->monthly_fee;
            }

            // Generate receipt number
            $receiptGenerator = new GenerateReceiptNumberAction();
            $receiptNumber = $receiptGenerator->execute(now());

            // Create the main payment record
            $payment = Payment::create([
                'member_id' => $member->id,
                'program_id' => null, // Compound payment for multiple sports
                'type' => PaymentType::ADMISSION,
                'amount' => $totalAmount,
                'month_year' => $currentMonth,
                'months_count' => 1,
                'status' => PaymentStatus::PENDING,
                'due_date' => now()->addDays(7), // 7 days to pay
                'paid_date' => null,
                'payment_method' => null,
                'receipt_number' => $receiptNumber,
                'reference_number' => null, // Will be set when paid
                'notes' => 'Initial admission fee and first month fee - created upon member approval',
            ]);

            // Create payment items for each sport
            foreach ($enrolledPrograms as $program) {
                // Admission fee item
                PaymentItem::create([
                    'payment_id' => $payment->id,
                    'program_id' => $program->id,
                    'type' => PaymentType::ADMISSION,
                    'amount' => $program->admission_fee,
                    'month_year' => null,
                    'description' => "{$program->name} - Admission Fee",
                ]);

                // First month fee item
                PaymentItem::create([
                    'payment_id' => $payment->id,
                    'program_id' => $program->id,
                    'type' => PaymentType::MONTHLY,
                    'amount' => $program->monthly_fee,
                    'month_year' => $currentMonth,
                    'description' => "{$program->name} - Monthly Fee ({$currentMonth})",
                ]);
            }

            // Log the creation
            $member->log('payment_created', "Pending admission payment created: {$receiptNumber}", [
                'payment_id' => $payment->id,
                'amount' => $totalAmount,
                'programs_count' => $enrolledPrograms->count(),
            ]);

            return $payment->fresh(['items.program']);
        });
    }
}
