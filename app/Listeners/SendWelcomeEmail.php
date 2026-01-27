<?php

namespace App\Listeners;

use App\Events\MemberApproved;
use App\Services\NotificationService;

class SendWelcomeEmail
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function handle(MemberApproved $event): void
    {
        $this->notificationService->sendWelcomeEmail(
            $event->member,
            $event->temporaryPassword
        );
    }
}
