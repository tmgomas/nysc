<?php

namespace App\Policies;

use App\Models\{Program, User};

class ProgramPolicy
{
    /**
     * Determine if the user can view any programs.
     */
    public function viewAny(User $user): bool
    {
        return true; // Everyone can view programs
    }

    /**
     * Determine if the user can view the program.
     */
    public function view(User $user, Program $program): bool
    {
        return true; // Everyone can view individual programs
    }

    /**
     * Determine if the user can create programs.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_programs');
    }

    /**
     * Determine if the user can update the program.
     */
    public function update(User $user, Program $program): bool
    {
        return $user->hasPermissionTo('edit_programs');
    }

    /**
     * Determine if the user can delete the program.
     */
    public function delete(User $user, Program $program): bool
    {
        // Can't delete if there are active members
        if ($program->members()->where('member_programs.status', 'active')->exists()) {
            return false;
        }

        return $user->hasPermissionTo('delete_programs');
    }
}
