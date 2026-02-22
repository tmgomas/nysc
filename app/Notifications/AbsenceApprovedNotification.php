<?php

namespace App\Notifications;

use App\Models\ClassAbsence;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AbsenceApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(public ClassAbsence $absence) {}

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $deadline = $this->absence->makeup_deadline->format('M d, Y');
        $className = $this->absence->programClass->label ?? $this->absence->programClass->day_of_week;

        return (new MailMessage)
            ->subject('Absence Approved - Select Your Makeup Class')
            ->greeting("Hello {$notifiable->full_name}!")
            ->line("Your absence for **{$className}** on **{$this->absence->absent_date->format('M d, Y')}** has been approved.")
            ->line("You have until **{$deadline}** to select a makeup class (within the same month).")
            ->line("Maximum 2 makeup classes are allowed per month.")
            ->action('Select Makeup Class', url('/member/absences/' . $this->absence->id . '/makeup'))
            ->line('If you do not select a makeup class by the deadline, the absence will be recorded.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type'       => 'absence_approved',
            'absence_id' => $this->absence->id,
            'message'    => "Your absence has been approved. Select a makeup class by {$this->absence->makeup_deadline->format('M d, Y')}.",
            'deadline'   => $this->absence->makeup_deadline->toDateString(),
        ];
    }
}
