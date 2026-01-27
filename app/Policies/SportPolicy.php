<?php

namespace App\Policies;

use App\Models\{Sport, User};

class SportPolicy
{
    /**
     * Determine if the user can view any sports.
     */
    public function viewAny(User $user): bool
    {
        return true; // Everyone can view sports
    }

    /**
     * Determine if the user can view the sport.
     */
    public function view(User $user, Sport $sport): bool
    {
        return true; // Everyone can view individual sports
    }

    /**
     * Determine if the user can create sports.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_sports');
    }

    /**
     * Determine if the user can update the sport.
     */
    public function update(User $user, Sport $sport): bool
    {
        return $user->hasPermissionTo('edit_sports');
    }

    /**
     * Determine if the user can delete the sport.
     */
    public function delete(User $user, Sport $sport): bool
    {
        // Can't delete if there are active members
        if ($sport->members()->where('member_sports.status', 'active')->exists()) {
            return false;
        }

        return $user->hasPermissionTo('delete_sports');
    }
}
