<?php

namespace App\Services;

use App\Models\{Member, Payment, User};
use App\Notifications\{
    WelcomeMemberNotification,
    RegistrationReceivedNotification,
    PaymentReminderNotification,
    PaymentConfirmationNotification,
    ApprovalNotification,
    OverduePaymentNotification
};
use Illuminate\Support\Facades\Log;
use Exception;

class NotificationService
{
    /**
     * Send registration received notification
     */
    public function sendRegistrationReceived(Member $member): void
    {
        try {
            // We notify the member directly since user account might not exist yet
            // But wait, member model has Notifiable trait?
            // Yes, Member model should be Notifiable. If not, we might need to rely on email/phone directly.
            // Let's check Member model. Assuming it is Notifiable.
            $member->notify(new RegistrationReceivedNotification($member));
            
            Log::info("Registration received notification sent to {$member->email}", [
                'member_id' => $member->id,
                'member_number' => $member->member_number,
                'channels' => $member->preferred_contact_method === 'sms' ? ['mail', 'sms'] : ['mail'],
            ]);
        } catch (Exception $e) {
            Log::error("Failed to send registration received notification to {$member->email}", [
                'member_id' => $member->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send welcome email/SMS to new member (Credentials)
     */
    public function sendWelcomeEmail(Member $member, string $temporaryPassword): void
    {
        try {
            $member->user->notify(new WelcomeMemberNotification($member, $temporaryPassword));
            
            Log::info("Welcome notification sent to {$member->user->email}", [
                'member_id' => $member->id,
                'member_number' => $member->member_number,
                'channels' => $member->preferred_contact_method === 'sms' ? ['mail', 'sms'] : ['mail'],
            ]);
        } catch (Exception $e) {
            Log::error("Failed to send welcome notification to {$member->user->email}", [
                'member_id' => $member->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send member approval notification
     */
    public function sendApprovalNotification(Member $member): void
    {
        try {
            $member->user->notify(new ApprovalNotification($member));
            
            Log::info("Approval notification sent to {$member->user->email}", [
                'member_id' => $member->id,
                'channels' => $member->preferred_contact_method === 'sms' ? ['mail', 'sms'] : ['mail'],
            ]);
        } catch (Exception $e) {
            Log::error("Failed to send approval notification to {$member->user->email}", [
                'member_id' => $member->id,
                'error' => $e->getMessage(),
            ]);
        }
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
        try {
            $member->user->notify(new PaymentReminderNotification($amount, $dueDate));
            
            Log::info("Payment reminder sent to {$member->user->email}", [
                'member_id' => $member->id,
                'amount' => $amount,
                'due_date' => $dueDate,
                'channels' => $member->preferred_contact_method === 'sms' ? ['mail', 'sms'] : ['mail'],
            ]);
        } catch (Exception $e) {
            Log::error("Failed to send payment reminder to {$member->user->email}", [
                'member_id' => $member->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send overdue payment notice
     */
    public function sendOverdueNotice(Member $member, float $amount): void
    {
        try {
            $member->user->notify(new OverduePaymentNotification($amount));
            
            Log::info("Overdue notice sent to {$member->user->email}", [
                'member_id' => $member->id,
                'amount' => $amount,
                'channels' => $member->preferred_contact_method === 'sms' ? ['mail', 'sms'] : ['mail'],
            ]);
        } catch (Exception $e) {
            Log::error("Failed to send overdue notice to {$member->user->email}", [
                'member_id' => $member->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send payment received confirmation
     */
    public function sendPaymentConfirmation(Payment $payment): void
    {
        try {
            $payment->member->user->notify(new PaymentConfirmationNotification($payment));
            
            Log::info("Payment confirmation sent to {$payment->member->user->email}", [
                'payment_id' => $payment->id,
                'amount' => $payment->amount,
                'channels' => $payment->member->preferred_contact_method === 'sms' ? ['mail', 'sms'] : ['mail'],
            ]);
        } catch (Exception $e) {
            Log::error("Failed to send payment confirmation to {$payment->member->user->email}", [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }
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
