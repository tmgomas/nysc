<?php

namespace App\Exceptions\Member;

use App\Enums\MemberStatus;
use App\Models\Member;
use Exception;

class InvalidMemberStatusException extends Exception
{
    /**
     * Create exception for suspended member
     */
    public static function suspended(Member $member): self
    {
        return new self(
            "Member '{$member->member_number}' is suspended and cannot perform this action."
        );
    }

    /**
     * Create exception for pending member
     */
    public static function pending(Member $member): self
    {
        return new self(
            "Member '{$member->member_number}' is pending approval and cannot perform this action."
        );
    }

    /**
     * Create exception for inactive member
     */
    public static function inactive(Member $member): self
    {
        return new self(
            "Member '{$member->member_number}' is inactive and cannot perform this action."
        );
    }

    /**
     * Create exception for invalid status transition
     */
    public static function invalidTransition(MemberStatus $from, MemberStatus $to): self
    {
        return new self(
            "Cannot transition member status from '{$from->value}' to '{$to->value}'."
        );
    }
}
