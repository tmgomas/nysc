<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use TextLK\Laravel\SMS\TextLKSMSMessage;

class PaymentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public float $amount,
        public string $dueDate,
        public string $description = 'membership fees'
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
            ->subject('Payment Reminder - NYCSC')
            ->greeting('Hello!')
            ->line("This is a friendly reminder that you have a payment due.")
            ->line("**Amount:** Rs. " . number_format($this->amount, 2))
            ->line("**Due Date:** {$this->dueDate}")
            ->line('Please ensure your payment is made on time to avoid any account suspension.')
            ->action('Make Payment', url('/payments'))
            ->line('Thank you for your cooperation!');
    }

    /**
     * Get the TextLK SMS representation of the notification.
     */
    public function getFormattedAmount(): string
    {
        return number_format($this->amount, 2);
    }

    /**
     * Get the TextLK SMS representation of the notification.
     */
    public function toTextlk(object $notifiable): TextLKSMSMessage
    {
        $template = \App\Models\SmsTemplate::where('key', 'payment.reminder')->first();

        if ($template && $template->active) {
            $message = $template->parse([
                'name' => $notifiable->member->calling_name,
                'amount' => $this->getFormattedAmount(),
                'due_date' => $this->dueDate,
                'description' => $this->description,
            ]);
        } else {
            $message = "Payment reminder: Rs." . $this->getFormattedAmount() . " due on {$this->dueDate}. Please pay on time to avoid suspension.";
        }
        
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
            'due_date' => $this->dueDate,
        ];
    }
}
