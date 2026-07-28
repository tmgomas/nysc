<?php

namespace App\Http\Controllers\PayHere;

use App\Actions\ProcessOnlinePaymentAction;
use App\Http\Controllers\Controller;
use App\Models\OnlinePaymentTransaction;
use App\Models\Payment;
use App\Services\PayHereService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PayHereController extends Controller
{
    public function __construct(
        protected PayHereService $payHereService,
        protected ProcessOnlinePaymentAction $processOnlinePayment
    ) {}

    /**
     * Initiate an online payment for a pending payment
     */
    public function initiatePayment(Payment $payment): JsonResponse
    {
        $member = Auth::user()->member;

        // Validate that this payment belongs to the authenticated member
        if ($payment->member_id !== $member->id) {
            abort(403, 'Unauthorized payment access.');
        }

        // Only pending payments can be paid online
        if ($payment->status->value !== 'pending') {
            return response()->json([
                'message' => 'Only pending payments can be paid online.',
            ], 422);
        }

        // Check if there's already a pending online transaction for this payment
        $existingTransaction = OnlinePaymentTransaction::where('payment_id', $payment->id)
            ->where('status', 'pending')
            ->where('initiated_at', '>', now()->subMinutes(30))
            ->first();

        if ($existingTransaction) {
            // Reuse existing transaction
            $checkoutData = $this->payHereService->buildCheckoutData(
                $payment,
                $member,
                $existingTransaction->order_id,
                route('member.payhere.return'),
                route('member.payhere.cancel'),
                route('payhere.notify')
            );

            return response()->json($checkoutData);
        }

        // Generate new order ID and create transaction
        $orderId = $this->payHereService->generateOrderId($payment);
        $amount = number_format((float) $payment->amount, 2, '.', '');
        $hash = $this->payHereService->generateCheckoutHash($orderId, $amount);

        $this->payHereService->createTransaction($payment, $member, $orderId, $hash);

        $checkoutData = $this->payHereService->buildCheckoutData(
            $payment,
            $member,
            $orderId,
            route('member.payhere.return'),
            route('member.payhere.cancel'),
            route('payhere.notify')
        );

        return response()->json($checkoutData);
    }

    /**
     * Confirm payment from frontend SDK completion callback
     */
    public function confirmPayment(Payment $payment, Request $request): JsonResponse
    {
        $member = Auth::user()->member;

        if ($payment->member_id !== $member->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = OnlinePaymentTransaction::where('payment_id', $payment->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($transaction) {
            $orderId = $request->input('order_id', $transaction->order_id);
            $this->processOnlinePayment->execute(
                $transaction,
                $orderId,
                'CARD',
                $request->all()
            );
        }

        return response()->json(['message' => 'Payment confirmed successfully.']);
    }

    /**
     * Handle PayHere return URL (user redirected here after successful payment)
     */
    public function handleReturn(Request $request)
    {
        return Inertia::render('Member/PaymentSuccess', [
            'orderId' => $request->query('order_id'),
        ]);
    }

    /**
     * Handle PayHere cancel URL (user redirected here after cancelling payment)
     */
    public function handleCancel(Request $request)
    {
        return Inertia::render('Member/PaymentCancelled', [
            'orderId' => $request->query('order_id'),
        ]);
    }

    /**
     * Handle PayHere server-to-server webhook notification
     */
    public function handleNotify(Request $request)
    {
        Log::info('PayHere Webhook received', $request->all());

        $merchantId = $request->input('merchant_id');
        $orderId = $request->input('order_id');
        $payhereAmount = $request->input('payhere_amount');
        $payhereCurrency = $request->input('payhere_currency');
        $statusCode = $request->input('status_code');
        $md5sig = $request->input('md5sig');

        // Verify webhook signature
        if (! $this->payHereService->verifyWebhookSignature(
            $orderId,
            $payhereAmount,
            $payhereCurrency,
            $statusCode,
            $md5sig
        )) {
            Log::warning('PayHere Webhook: Invalid signature', [
                'order_id' => $orderId,
                'merchant_id' => $merchantId,
            ]);

            return response('Invalid Signature', 400);
        }

        // Find the transaction
        $transaction = OnlinePaymentTransaction::where('order_id', $orderId)->first();

        if (! $transaction) {
            Log::warning('PayHere Webhook: Transaction not found', ['order_id' => $orderId]);

            return response('Transaction Not Found', 404);
        }

        $statusCode = (int) $statusCode;

        if ($statusCode === 2) {
            // Payment Successful
            $this->processOnlinePayment->execute(
                $transaction,
                $request->input('payment_id', ''),
                $request->input('method', 'CARD'),
                $request->all()
            );

            Log::info('PayHere Webhook: Payment successful', ['order_id' => $orderId]);
        } elseif ($statusCode === 0) {
            // Payment Pending
            Log::info('PayHere Webhook: Payment pending', ['order_id' => $orderId]);
        } elseif ($statusCode === -1) {
            // Cancelled
            $transaction->markAsCancelled($request->all());
            Log::info('PayHere Webhook: Payment cancelled', ['order_id' => $orderId]);
        } elseif ($statusCode === -2) {
            // Failed
            $transaction->markAsFailed($request->all());
            Log::info('PayHere Webhook: Payment failed', ['order_id' => $orderId]);
        } elseif ($statusCode === -3) {
            // Chargedback
            $transaction->markAsFailed($request->all());
            Log::warning('PayHere Webhook: Payment chargedback', ['order_id' => $orderId]);
        }

        return response('OK', 200);
    }
}
