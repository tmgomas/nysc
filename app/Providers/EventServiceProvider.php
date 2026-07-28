<?php

namespace App\Providers;

use App\Events\MemberApproved;
use App\Events\PaymentReceived;
use App\Listeners\GenerateMembershipCard;
use App\Listeners\SendPaymentConfirmation;
use App\Listeners\SendWelcomeEmail;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

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
