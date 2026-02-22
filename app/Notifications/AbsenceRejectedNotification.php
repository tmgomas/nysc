<?php

namespace App\Notifications;

use App\Models\ClassAbsence;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AbsenceRejectedNotification extends Notification
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
            ->subject('Absence Request Rejected')
            ->greeting("Hello {$notifiable->full_name},")
            ->line("Your absence request for **{$className}** on **{$this->absence->absent_date->format('M d, Y')}** has been rejected.")
            ->when($this->absence->admin_notes, fn($m) => $m->line("**Reason:** {$this->absence->admin_notes}"))
            ->line('Please contact the club administration if you have any questions.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type'       => 'absence_rejected',
            'absence_id' => $this->absence->id,
            'message'    => "Your absence request for {$this->absence->absent_date->format('M d, Y')} was rejected.",
        ];
    }
}
