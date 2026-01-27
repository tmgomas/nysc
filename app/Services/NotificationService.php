<?php

namespace App\Services;

use App\Models\{Member, Payment, User};
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    /**
     * Send welcome email to new member
     */
    public function sendWelcomeEmail(Member $member, string $temporaryPassword): void
    {
        // TODO: Implement actual email sending
        // Mail::to($member->user->email)->send(new WelcomeEmail($member, $temporaryPassword));
        
        \Log::info("Welcome email sent to {$member->user->email}", [
            'member_id' => $member->id,
            'member_number' => $member->member_number,
        ]);
    }

    /**
     * Send member approval notification
     */
    public function sendApprovalNotification(Member $member): void
    {
        \Log::info("Approval notification sent to {$member->user->email}", [
            'member_id' => $member->id,
        ]);
    }

    /**
     * Send member rejection notification
     */
    public function sendRejectionNotification(Member $member, string $reason): void
    {
        \Log::info("Rejection notification sent", [
            'member_id' => $member->id,
            'reason' => $reason,
        ]);
    }

    /**
     * Send payment reminder
     */
    public function sendPaymentReminder(Member $member, float $amount, string $dueDate): void
    {
        \Log::info("Payment reminder sent to {$member->user->email}", [
            'member_id' => $member->id,
            'amount' => $amount,
            'due_date' => $dueDate,
        ]);
    }

    /**
     * Send overdue payment notice
     */
    public function sendOverdueNotice(Member $member, float $amount): void
    {
        \Log::info("Overdue notice sent to {$member->user->email}", [
            'member_id' => $member->id,
            'amount' => $amount,
        ]);
    }

    /**
     * Send payment received confirmation
     */
    public function sendPaymentConfirmation(Payment $payment): void
    {
        \Log::info("Payment confirmation sent to {$payment->member->user->email}", [
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
        ]);
    }

    /**
     * Send payment verification notification
     */
    public function sendPaymentVerified(Payment $payment): void
    {
        \Log::info("Payment verified notification sent to {$payment->member->user->email}", [
            'payment_id' => $payment->id,
        ]);
    }

    /**
     * Send suspension warning
     */
    public function sendSuspensionWarning(Member $member, string $reason): void
    {
        \Log::info("Suspension warning sent to {$member->user->email}", [
            'member_id' => $member->id,
            'reason' => $reason,
        ]);
    }

    /**
     * Send bulk payment reminders
     */
    public function sendBulkPaymentReminders(): int
    {
        $members = Member::whereHas('paymentSchedules', function ($query) {
            $query->where('status', 'pending')
                ->where('due_date', '<=', now()->addDays(7))
                ->where('due_date', '>=', now());
        })->get();

        foreach ($members as $member) {
            $nextDue = $member->next_due_payment;
            if ($nextDue) {
                $this->sendPaymentReminder($member, $nextDue->amount, $nextDue->due_date->format('Y-m-d'));
            }
        }

        return $members->count();
    }

    /**
     * Send bulk overdue notices
     */
    public function sendBulkOverdueNotices(): int
    {
        $members = Member::whereHas('overduePayments')->get();

        foreach ($members as $member) {
            $overdueAmount = $member->overduePayments()->sum('amount');
            $this->sendOverdueNotice($member, $overdueAmount);
        }

        return $members->count();
    }
}
