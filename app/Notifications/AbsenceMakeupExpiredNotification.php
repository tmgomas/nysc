<?php

namespace App\Notifications;

use App\Models\ClassAbsence;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AbsenceMakeupExpiredNotification extends Notification
{
    use Queueable;

    public function __construct(public ClassAbsence $absence) {}

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $className = $this->absence->programClass->label ?? $this->absence->programClass->day_of_week;

        return (new MailMessage)
            ->subject('Makeup Class Window Expired')
            ->greeting("Hello {$notifiable->full_name},")
            ->line("The makeup class selection window for your absence on **{$this->absence->absent_date->format('M d, Y')}** ({$className}) has expired.")
            ->line('The absence has been recorded in your attendance history.')
            ->line('Please contact the club administration if you need assistance.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type'       => 'makeup_expired',
            'absence_id' => $this->absence->id,
            'message'    => "Makeup window expired for absence on {$this->absence->absent_date->format('M d, Y')}.",
        ];
    }
}
