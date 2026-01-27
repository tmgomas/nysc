<?php

namespace App\Listeners;

use App\Events\MemberApproved;
use App\Actions\GenerateQRCodeAction;

class GenerateMembershipCard
{
    public function __construct(
        protected GenerateQRCodeAction $generateQRCode
    ) {}

    public function handle(MemberApproved $event): void
    {
        // Generate QR code for member
        $this->generateQRCode->execute($event->member);
        
        // TODO: Generate PDF membership card
        \Log::info("Membership card generated for member: {$event->member->member_number}");
    }
}
