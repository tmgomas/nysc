<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendOverdueNoticesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:send-overdue-notices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send overdue notices to members with pending overdue payments';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService)
    {
        $this->info('Starting overdue notices...');

        $count = $notificationService->sendBulkOverdueNotices();

        $this->info("Sent {$count} overdue notices successfully.");
    }
}
