<?php

namespace App\Actions;

use App\Models\Member;
use App\Models\User;
use App\Enums\MemberStatus;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateMemberAccountAction
{
    /**
     * Create a user account for an approved member
     */
    public function execute(Member $member): User
    {
        // Generate email if not provided
        $email = $this->generateEmail($member);
        
        // Generate temporary password
        $temporaryPassword = Str::random(12);

        // Create user account
        $user = User::create([
            'name' => $member->nic_passport, // Will be updated by member
            'email' => $email,
            'password' => Hash::make($temporaryPassword),
            'email_verified_at' => null, // Require email verification
        ]);

        // Assign member role
        $user->assignRole('member');

        // Link user to member
        $member->update(['user_id' => $user->id]);

        // Store temporary password for email notification
        $user->temporary_password = $temporaryPassword;

        return $user;
    }

    /**
     * Generate email from member number
     */
    protected function generateEmail(Member $member): string
    {
        $baseEmail = strtolower($member->member_number) . '@nysc.lk';
        
        // Check if email already exists
        $counter = 1;
        $email = $baseEmail;
        
        while (User::where('email', $email)->exists()) {
            $email = strtolower($member->member_number) . $counter . '@nysc.lk';
            $counter++;
        }

        return $email;
    }
}
