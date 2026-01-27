<?php

namespace App\Traits;

use App\Models\Payment;
use App\Models\MemberPaymentSchedule;
use App\Enums\PaymentStatus;

trait HasPayments
{
    /**
     * Get all payments for this model
     */
    public function payments()
    {
        return $this->hasMany(Payment::class, 'member_id');
    }

    /**
     * Get payment schedules
     */
    public function paymentSchedules()
    {
        return $this->hasMany(MemberPaymentSchedule::class, 'member_id');
    }

    /**
     * Get pending payments
     */
    public function pendingPayments()
    {
        return $this->payments()->where('status', PaymentStatus::PENDING);
    }

    /**
     * Get verified payments
     */
    public function verifiedPayments()
    {
        return $this->payments()->where('status', PaymentStatus::VERIFIED);
    }

    /**
     * Get overdue payments
     */
    public function overduePayments()
    {
        return $this->payments()
            ->where('status', PaymentStatus::PENDING)
            ->where('due_date', '<', now());
    }

    /**
     * Get total paid amount
     */
    public function getTotalPaidAttribute()
    {
        return $this->payments()
            ->whereIn('status', [PaymentStatus::PAID, PaymentStatus::VERIFIED])
            ->sum('amount');
    }

    /**
     * Get total pending amount
     */
    public function getTotalPendingAttribute()
    {
        return $this->payments()
            ->where('status', PaymentStatus::PENDING)
            ->sum('amount');
    }

    /**
     * Check if has overdue payments
     */
    public function hasOverduePayments(): bool
    {
        return $this->overduePayments()->exists();
    }

    /**
     * Get last payment
     */
    public function getLastPaymentAttribute()
    {
        return $this->payments()
            ->whereIn('status', [PaymentStatus::PAID, PaymentStatus::VERIFIED])
            ->latest('paid_date')
            ->first();
    }

    /**
     * Get next due payment
     */
    public function getNextDuePaymentAttribute()
    {
        return $this->paymentSchedules()
            ->where('status', 'pending')
            ->orderBy('due_date')
            ->first();
    }

    /**
     * Check if payment is up to date
     */
    public function isPaymentUpToDate(): bool
    {
        return !$this->hasOverduePayments();
    }
}
