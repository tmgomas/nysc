<?php

namespace App\Actions;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\OnlinePaymentTransaction;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessOnlinePaymentAction
{
    public function __construct(
        protected MarkPaymentAsPaidAction $markPaymentAsPaid
    ) {}

    /**
     * Process a successful online payment from PayHere webhook
     */
    public function execute(
        OnlinePaymentTransaction $transaction,
        string $gatewayTransactionId,
        string $gatewayMethod,
        array $gatewayResponse
    ): Payment {
        return DB::transaction(function () use ($transaction, $gatewayTransactionId, $gatewayMethod, $gatewayResponse) {
            // Mark the online transaction as successful
            $transaction->markAsSuccess($gatewayTransactionId, $gatewayMethod, $gatewayResponse);

            $payment = $transaction->payment;

            // Only process if payment is still pending
            if ($payment->status !== PaymentStatus::PENDING) {
                Log::info('PayHere: Payment already processed', [
                    'payment_id' => $payment->id,
                    'status' => $payment->status->value,
                ]);

                return $payment;
            }

            // Use existing action to mark payment as paid
            $payment = $this->markPaymentAsPaid->execute(
                $payment,
                PaymentMethod::ONLINE->value,
                $gatewayTransactionId
            );

            Log::info('PayHere: Payment marked as paid', [
                'payment_id' => $payment->id,
                'transaction_id' => $gatewayTransactionId,
                'method' => $gatewayMethod,
                'amount' => $transaction->amount,
            ]);

            return $payment;
        });
    }
}
