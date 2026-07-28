<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Schedule the daily payment reminders (e.g. at 8:00 AM)
Schedule::command('payments:send-reminders')->dailyAt('08:00');

// Schedule the daily overdue notices (e.g. at 9:00 AM)
Schedule::command('payments:send-overdue-notices')->dailyAt('09:00');

// Schedule the auto-suspension check (e.g. at 1:00 AM)
Schedule::command('members:suspend-overdue')->dailyAt('01:00');
