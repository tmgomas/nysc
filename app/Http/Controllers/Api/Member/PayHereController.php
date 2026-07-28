<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\OnlinePaymentTransaction;
use App\Models\Payment;
use App\Services\PayHereService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PayHereController extends Controller
{
    public function __construct(
        protected PayHereService $payHereService
    ) {}

    /**
     * Initiate an online payment via API (for mobile app)
     */
    public function initiatePayment(Payment $payment): JsonResponse
    {
        $member = Auth::user()->member;

        if ($payment->member_id !== $member->id) {
            return response()->json(['message' => 'Unauthorized payment access.'], 403);
        }

        if ($payment->status->value !== 'pending') {
            return response()->json(['message' => 'Only pending payments can be paid online.'], 422);
        }

        // Check for existing pending transaction
        $existingTransaction = OnlinePaymentTransaction::where('payment_id', $payment->id)
            ->where('status', 'pending')
            ->where('initiated_at', '>', now()->subMinutes(30))
            ->first();

        if ($existingTransaction) {
            $checkoutData = $this->payHereService->buildCheckoutData(
                $payment,
                $member,
                $existingTransaction->order_id,
                route('payhere.notify'), // Return URL handled by mobile deep link
                route('payhere.notify'), // Cancel URL handled by mobile deep link
                route('payhere.notify')
            );

            return response()->json($checkoutData);
        }

        $orderId = $this->payHereService->generateOrderId($payment);
        $amount = number_format((float) $payment->amount, 2, '.', '');
        $hash = $this->payHereService->generateCheckoutHash($orderId, $amount);

        $this->payHereService->createTransaction($payment, $member, $orderId, $hash);

        $checkoutData = $this->payHereService->buildCheckoutData(
            $payment,
            $member,
            $orderId,
            config('app.url').'/api/member/payments/online/return',
            config('app.url').'/api/member/payments/online/cancel',
            route('payhere.notify')
        );

        return response()->json($checkoutData);
    }
}
