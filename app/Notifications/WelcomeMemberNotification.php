<?php

namespace App\Notifications;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use TextLK\Laravel\SMS\TextLKSMSMessage;

class WelcomeMemberNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Member $member,
        public string $temporaryPassword
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
            ->subject('Welcome to NYCSC!')
            ->greeting("Welcome to NYCSC, {$this->member->calling_name}!")
            ->line('Your membership registration has been received.')
            ->line('Your login credentials are:')
            ->line("**Email:** {$this->member->email}")
            ->line("**Temporary Password:** {$this->temporaryPassword}")
            ->action('Login Now', url('/login'))
            ->line('Please change your password after your first login.')
            ->line('Thank you for joining the Naval and Maritime Academy Sports Club!');
    }

    /**
     * Get the TextLK SMS representation of the notification.
     */
    public function toTextlk(object $notifiable): TextLKSMSMessage
    {
        $template = \App\Models\SmsTemplate::where('key', 'member.credentials')->first();
        
        if ($template && $template->active) {
            $message = $template->parse([
                'name' => $this->member->calling_name,
                'email' => $this->member->email,
                'password' => $this->temporaryPassword,
            ]);
        } else {
            $message = "Welcome to NYCSC! Your login: {$this->member->email}. Password: {$this->temporaryPassword}. Change it after first login.";
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
        ];
    }
}
