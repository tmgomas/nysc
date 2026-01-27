<?php

namespace App\Policies;

use App\Models\{Member, User};
use App\Enums\MemberStatus;

class MemberPolicy
{
    /**
     * Determine if the user can view any members.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_members');
    }

    /**
     * Determine if the user can view the member.
     */
    public function view(User $user, Member $member): bool
    {
        // Admins can view all
        if ($user->hasPermissionTo('view_members')) {
            return true;
        }

        // Members can view their own profile
        return $user->member?->id === $member->id;
    }

    /**
     * Determine if the user can create members.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_members');
    }

    /**
     * Determine if the user can update the member.
     */
    public function update(User $user, Member $member): bool
    {
        // Admins can update all
        if ($user->hasPermissionTo('edit_members')) {
            return true;
        }

        // Members can update their own profile (limited fields)
        return $user->member?->id === $member->id;
    }

    /**
     * Determine if the user can delete the member.
     */
    public function delete(User $user, Member $member): bool
    {
        return $user->hasPermissionTo('delete_members');
    }

    /**
     * Determine if the user can approve the member.
     */
    public function approve(User $user, Member $member): bool
    {
        return $user->hasPermissionTo('approve_members') 
            && $member->status === MemberStatus::PENDING;
    }

    /**
     * Determine if the user can suspend the member.
     */
    public function suspend(User $user, Member $member): bool
    {
        return $user->hasPermissionTo('suspend_members')
            && $member->status !== MemberStatus::SUSPENDED;
    }
}
