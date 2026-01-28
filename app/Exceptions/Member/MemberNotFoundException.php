<?php

namespace App\Exceptions\Member;

use Exception;

class MemberNotFoundException extends Exception
{
    /**
     * Create exception for member not found by ID
     */
    public static function withId(string $id): self
    {
        return new self("Member with ID '{$id}' not found.");
    }

    /**
     * Create exception for member not found by member number
     */
    public static function withMemberNumber(string $memberNumber): self
    {
        return new self("Member with number '{$memberNumber}' not found.");
    }

    /**
     * Create exception for member not found by NIC
     */
    public static function withNic(string $nic): self
    {
        return new self("Member with NIC/Passport '{$nic}' not found.");
    }

    /**
     * Create exception for member not found by email
     */
    public static function withEmail(string $email): self
    {
        return new self("Member with email '{$email}' not found.");
    }
}
