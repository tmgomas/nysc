<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $member = Auth::user()->member;

        $payments = $member->payments()
            ->with(['items.program', 'program'])
            ->latest()
            ->get();

        $pendingPayments = $member->payments()
            ->where('status', 'pending')
            ->with(['items.program', 'program'])
            ->latest()
            ->get();

        $payHereEnabled = ! empty(config('services.payhere.merchant_id'));

        return Inertia::render('Member/PaymentHistory', [
            'payments' => $payments,
            'pendingPayments' => $pendingPayments,
            'payHereEnabled' => $payHereEnabled,
            'payHereMerchantId' => config('services.payhere.merchant_id'),
        ]);
    }

    public function receipt(\App\Models\Payment $payment)
    {
        $member = Auth::user()->member;
        
        if ($payment->member_id !== $member->id) {
            abort(403, 'Unauthorized action.');
        }

        if (!in_array($payment->status->value, ['paid', 'verified'])) {
            abort(403, 'Receipt is only available for paid or verified payments.');
        }

        $payment->load(['member', 'items']);
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('receipts.payment', compact('payment'));
        
        if (request()->query('action') === 'print') {
            return $pdf->stream("receipt-{$payment->receipt_number}.pdf");
        }

        return $pdf->download("receipt-{$payment->receipt_number}.pdf");
    }
}
