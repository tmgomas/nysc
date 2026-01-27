<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\{
    MemberRegistered,
    MemberApproved,
    MemberRejected,
    MemberSuspended,
    PaymentReceived,
    PaymentVerified,
    AttendanceMarked
};
use App\Listeners\{
    SendWelcomeEmail,
    GenerateMembershipCard,
    SendPaymentConfirmation
};

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     */
    protected $listen = [
        MemberApproved::class => [
            SendWelcomeEmail::class,
            GenerateMembershipCard::class,
        ],
        PaymentReceived::class => [
            SendPaymentConfirmation::class,
        ],
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
