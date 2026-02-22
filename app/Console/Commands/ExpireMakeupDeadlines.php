<?php

namespace App\Console\Commands;

use App\Services\ClassAbsenceService;
use Illuminate\Console\Command;

class ExpireMakeupDeadlines extends Command
{
    protected $signature   = 'absences:expire-deadlines';
    protected $description = 'Expire absence makeup windows that have passed the 7-day deadline';

    public function handle(ClassAbsenceService $service): int
    {
        $count = $service->expireDeadlines();

        $this->info("Expired {$count} absence makeup deadline(s).");

        return Command::SUCCESS;
    }
}
