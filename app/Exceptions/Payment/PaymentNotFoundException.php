<?php

namespace App\Exceptions\Payment;

use Exception;

class PaymentNotFoundException extends Exception
{
    /**
     * Create exception for payment not found by ID
     */
    public static function withId(string $id): self
    {
        return new self("Payment with ID '{$id}' not found.");
    }

    /**
     * Create exception for payment schedule not found
     */
    public static function scheduleNotFound(string $memberId, string $monthYear): self
    {
        return new self(
            "Payment schedule not found for member '{$memberId}' for month '{$monthYear}'."
        );
    }

    /**
     * Create exception for no pending payments
     */
    public static function noPendingPayments(string $memberId): self
    {
        return new self("No pending payments found for member '{$memberId}'.");
    }
}
