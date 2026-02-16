<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use TextLK\Laravel\SMS\TextLKSMSMessage;

class PaymentConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Payment $payment
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['mail'];
        
        // Add SMS channel if member prefers SMS
        if ($notifiable->member->preferred_contact_method === 'sms') {
            $channels[] = \TextLK\Laravel\TextLKSMSChannel::class;
        }
        
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $sportName = $this->payment->items->first()?->sport?->name ?? 'Membership';
        
        return (new MailMessage)
            ->subject('Payment Received - NYCSC')
            ->greeting('Payment Confirmed!')
            ->line("We have received your payment. Thank you!")
            ->line("**Amount:** Rs. " . number_format($this->payment->amount, 2))
            ->line("**For:** {$sportName}")
            ->line("**Receipt Number:** {$this->payment->id}")
            ->line("**Date:** {$this->payment->created_at->format('Y-m-d')}")
            ->action('View Receipt', url("/payments/{$this->payment->id}"))
            ->line('Thank you for your payment!');
    }

    /**
     * Get the TextLK SMS representation of the notification.
     */
    public function toTextlk(object $notifiable): TextLKSMSMessage
    {
        $sportName = $this->payment->items->first()?->sport?->name ?? 'Membership';
        $amount = number_format($this->payment->amount, 2);
        
        $message = "Payment received! Rs.{$amount} for {$sportName}. Receipt #{$this->payment->id}. Thank you!";
        
        return (new TextLKSMSMessage())
            ->message($message)
            ->recipient($notifiable->routeNotificationFor('textlk', $this));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
        ];
    }
}
