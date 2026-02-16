<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use TextLK\Laravel\SMS\TextLKSMSMessage;

class OverduePaymentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public float $amount
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
        return (new MailMessage)
            ->subject('Overdue Payment Notice - NYCSC')
            ->level('warning')
            ->greeting('Payment Overdue')
            ->line('This is an urgent notice regarding your overdue payment.')
            ->line("**Overdue Amount:** Rs. " . number_format($this->amount, 2))
            ->line('Please settle your outstanding payment immediately to avoid account suspension and loss of club privileges.')
            ->action('Pay Now', url('/payments'))
            ->line('If you have already made the payment, please contact our office with your payment proof.');
    }

    /**
     * Get the TextLK SMS representation of the notification.
     */
    public function toTextlk(object $notifiable): TextLKSMSMessage
    {
        $message = "Payment overdue: Rs." . number_format($this->amount, 2) . ". Please settle immediately to avoid account suspension.";
        
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
            'amount' => $this->amount,
        ];
    }
}
