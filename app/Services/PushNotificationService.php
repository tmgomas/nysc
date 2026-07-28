<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class PushNotificationService
{
    public function __construct(protected Messaging $messaging)
    {
    }

    /**
     * Send a push notification to a specific user across all their registered devices.
     */
    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = $user->deviceTokens()->pluck('fcm_token')->toArray();
        
        if (empty($tokens)) {
            Log::info("PushNotificationService: No FCM tokens found for user {$user->id}");
            return;
        }

        $notification = Notification::create($title, $body);
        $message = CloudMessage::new()
            ->withNotification($notification)
            ->withData($data);

        try {
            $report = $this->messaging->sendMulticast($message, $tokens);

            if ($report->hasFailures()) {
                Log::warning('PushNotificationService: Some notifications failed.', [
                    'user_id' => $user->id,
                    'failures' => $report->failures()->getItems()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('PushNotificationService: Failed to send multicast message.', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send a push notification to a specific topic.
     */
    public function sendToTopic(string $topic, string $title, string $body, array $data = []): void
    {
        $notification = Notification::create($title, $body);
        $message = CloudMessage::withTarget('topic', $topic)
            ->withNotification($notification)
            ->withData($data);

        try {
            $this->messaging->send($message);
        } catch (\Exception $e) {
            Log::error("PushNotificationService: Failed to send to topic {$topic}.", [
                'error' => $e->getMessage()
            ]);
        }
    }
}
