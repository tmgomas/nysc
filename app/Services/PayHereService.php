<?php

namespace App\Services;

use App\Models\Member;
use App\Models\OnlinePaymentTransaction;
use App\Models\Payment;
use Illuminate\Support\Str;

class PayHereService
{
    /**
     * Generate a unique order ID for PayHere
     */
    public function generateOrderId(Payment $payment): string
    {
        return 'NYCSC-'.strtoupper(Str::random(8)).'-'.substr($payment->id, 0, 8);
    }

    /**
     * Get the PayHere checkout base URL based on environment mode
     */
    public function getCheckoutUrl(): string
    {
        $mode = config('services.payhere.mode', 'sandbox');

        return $mode === 'sandbox'
            ? 'https://sandbox.payhere.lk/pay/checkout'
            : 'https://www.payhere.lk/pay/checkout';
    }

    /**
     * Generate MD5 hash for PayHere checkout request
     *
     * Formula: STRTOUPPER(MD5(merchant_id + order_id + amount + currency + STRTOUPPER(MD5(merchant_secret))))
     */
    public function generateCheckoutHash(string $orderId, string $amount, string $currency = 'LKR'): string
    {
        $merchantId = config('services.payhere.merchant_id');
        $merchantSecret = config('services.payhere.merchant_secret');

        $hashedSecret = strtoupper(md5($merchantSecret));

        return strtoupper(md5($merchantId.$orderId.$amount.$currency.$hashedSecret));
    }

    /**
     * Verify the md5sig from PayHere webhook notification
     *
     * Formula: STRTOUPPER(MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + STRTOUPPER(MD5(merchant_secret))))
     */
    public function verifyWebhookSignature(
        string $orderId,
        string $payhereAmount,
        string $payhereCurrency,
        string $statusCode,
        string $md5sig
    ): bool {
        $merchantId = config('services.payhere.merchant_id');
        $merchantSecret = config('services.payhere.merchant_secret');

        $hashedSecret = strtoupper(md5($merchantSecret));
        $localMd5sig = strtoupper(
            md5($merchantId.$orderId.$payhereAmount.$payhereCurrency.$statusCode.$hashedSecret)
        );

        return hash_equals($localMd5sig, $md5sig);
    }

    /**
     * Build complete checkout data for a payment
     *
     * @return array{checkout_url: string, form_data: array<string, string>}
     */
    public function buildCheckoutData(
        Payment $payment,
        Member $member,
        string $orderId,
        string $returnUrl,
        string $cancelUrl,
        string $notifyUrl
    ): array {
        $amount = number_format((float) $payment->amount, 2, '.', '');
        $currency = 'LKR';
        $hash = $this->generateCheckoutHash($orderId, $amount, $currency);

        $nameParts = explode(' ', $member->full_name, 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        $formData = [
            'merchant_id' => config('services.payhere.merchant_id'),
            'return_url' => $returnUrl,
            'cancel_url' => $cancelUrl,
            'notify_url' => $notifyUrl,
            'order_id' => $orderId,
            'items' => $this->buildItemsDescription($payment),
            'currency' => $currency,
            'amount' => $amount,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $member->email ?: ($member->user?->email ?: 'noemail@nycsc.lk'),
            'phone' => $member->contact_number ?: '0000000000',
            'address' => $member->address ?: 'N/A',
            'city' => 'Colombo',
            'country' => 'Sri Lanka',
            'hash' => $hash,
            'custom_1' => $payment->id,
            'custom_2' => $member->id,
        ];

        return [
            'checkout_url' => $this->getCheckoutUrl(),
            'form_data' => $formData,
        ];
    }

    /**
     * Create an OnlinePaymentTransaction record for tracking
     */
    public function createTransaction(
        Payment $payment,
        Member $member,
        string $orderId,
        string $hash
    ): OnlinePaymentTransaction {
        return OnlinePaymentTransaction::create([
            'payment_id' => $payment->id,
            'member_id' => $member->id,
            'order_id' => $orderId,
            'amount' => $payment->amount,
            'currency' => 'LKR',
            'gateway' => 'payhere',
            'status' => 'pending',
            'hash' => $hash,
            'initiated_at' => now(),
        ]);
    }

    /**
     * Build human-readable items description for PayHere checkout
     */
    private function buildItemsDescription(Payment $payment): string
    {
        $payment->loadMissing('items.program');

        if ($payment->items->isEmpty()) {
            return "Payment #{$payment->receipt_number}";
        }

        $descriptions = $payment->items->map(function ($item) {
            $programName = $item->program?->name ?? 'General';
            $type = ucfirst($item->type->value);

            return "{$programName} - {$type}";
        });

        return $descriptions->implode(', ');
    }
}
