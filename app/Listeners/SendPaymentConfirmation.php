<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use App\Services\NotificationService;

class SendPaymentConfirmation
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function handle(PaymentReceived $event): void
    {
        $this->notificationService->sendPaymentConfirmation($event->payment);
    }
}
