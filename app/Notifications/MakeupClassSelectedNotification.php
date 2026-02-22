<?php

namespace App\Notifications;

use App\Models\ClassAbsence;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class MakeupClassSelectedNotification extends Notification
{
    use Queueable;

    public function __construct(public ClassAbsence $absence) {}

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $makeupClass = $this->absence->makeupClass;
        $memberName  = $this->absence->member->full_name;

        return (new MailMessage)
            ->subject('Member Booked a Makeup Class')
            ->line("**{$memberName}** has selected a makeup class.")
            ->line("**Original absence:** {$this->absence->absent_date->format('M d, Y')}")
            ->line("**Makeup class:** {$makeupClass->label} - {$makeupClass->day_of_week} ({$makeupClass->formatted_time})")
            ->line("**Makeup date:** {$this->absence->makeup_date->format('M d, Y')}");
    }

    public function toArray($notifiable): array
    {
        return [
            'type'        => 'makeup_selected',
            'absence_id'  => $this->absence->id,
            'member_name' => $this->absence->member->full_name,
            'makeup_date' => $this->absence->makeup_date->toDateString(),
            'message'     => "{$this->absence->member->full_name} booked makeup class for {$this->absence->makeup_date->format('M d, Y')}.",
        ];
    }
}
