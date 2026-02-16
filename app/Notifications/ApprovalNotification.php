<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use TextLK\Laravel\SMS\TextLKSMSMessage;

class ApprovalNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Member $member
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
        if ($this->member->preferred_contact_method === 'sms') {
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
            ->subject('Membership Approved - NYCSC')
            ->greeting("Congratulations, {$this->member->calling_name}!")
            ->line('Your NYCSC membership application has been approved.')
            ->line("**Member ID:** {$this->member->member_number}")
            ->line("**Approved on:** {$this->member->approved_at->format('Y-m-d')}")
            ->line('You now have full access to all club facilities and programs.')
            ->action('View Dashboard', url('/dashboard'))
            ->line('Welcome to the Naval and Maritime Academy Sports Club!');
    }

    /**
     * Get the TextLK SMS representation of the notification.
     */
    public function toTextlk(object $notifiable): TextLKSMSMessage
    {
        $template = \App\Models\SmsTemplate::where('key', 'member.approved')->first();

        if ($template && $template->active) {
            $message = $template->parse([
                'name' => $this->member->calling_name,
                'member_number' => $this->member->member_number,
            ]);
        } else {
            $message = "Congratulations! Your NYCSC membership is approved. Member ID: {$this->member->member_number}. Welcome to the club!";
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
            'member_id' => $this->member->id,
            'member_number' => $this->member->member_number,
            'approved_at' => $this->member->approved_at,
        ];
    }
}
