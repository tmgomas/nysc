<?php

namespace App\Events;

use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MemberApproved
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Member $member,
        public User $user,
        public string $temporaryPassword
    ) {}
}
