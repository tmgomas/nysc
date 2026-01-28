<?php

namespace App\Exceptions\Payment;

use Exception;

class InvalidPaymentAmountException extends Exception
{
    /**
     * Create exception for negative amount
     */
    public static function negative(float $amount): self
    {
        return new self("Payment amount cannot be negative. Received: Rs. {$amount}");
    }

    /**
     * Create exception for zero amount
     */
    public static function zero(): self
    {
        return new self("Payment amount must be greater than zero.");
    }

    /**
     * Create exception for amount mismatch
     */
    public static function mismatch(float $expected, float $received): self
    {
        return new self(
            "Payment amount mismatch. Expected: Rs. {$expected}, Received: Rs. {$received}"
        );
    }

    /**
     * Create exception for exceeding maximum
     */
    public static function exceedsMaximum(float $amount, float $maximum): self
    {
        return new self(
            "Payment amount Rs. {$amount} exceeds maximum allowed amount of Rs. {$maximum}"
        );
    }
}
