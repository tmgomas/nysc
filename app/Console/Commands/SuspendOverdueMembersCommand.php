<?php

namespace App\Console\Commands;

use App\Enums\MemberStatus;
use App\Models\Member;
use App\Services\MemberService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SuspendOverdueMembersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'members:suspend-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically suspend members who have payments overdue for more than 3 months (90 days)';

    /**
     * Execute the console command.
     */
    public function handle(MemberService $memberService)
    {
        $this->info('Checking for members with > 90 days overdue payments...');

        // Find members who have overdue payments older than 90 days
        $membersToSuspend = Member::where('status', MemberStatus::ACTIVE)
            ->whereHas('overduePayments', function ($query) {
                $query->where('due_date', '<', now()->subDays(90));
            })->get();

        if ($membersToSuspend->isEmpty()) {
            $this->info('No members found requiring suspension.');

            return;
        }

        $count = 0;
        foreach ($membersToSuspend as $member) {
            try {
                $memberService->suspend($member, 'Automatic suspension: Payments overdue for more than 90 days.');
                $this->info("Suspended member ID: {$member->member_number}");
                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to auto-suspend member {$member->id}: ".$e->getMessage());
                $this->error("Failed to auto-suspend member {$member->member_number}.");
            }
        }

        $this->info("Successfully suspended {$count} members.");
    }
}
