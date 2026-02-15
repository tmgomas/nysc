<?php

namespace App\Traits;

use App\Models\Program;
use App\Models\MemberProgram;

trait HasPrograms
{
    /**
     * Get all programs for this member
     */
    public function programs()
    {
        return $this->belongsToMany(Program::class, 'member_programs')
            ->using(MemberProgram::class)
            ->withPivot('enrolled_at', 'status', 'program_reference')
            ->withTimestamps();
    }

    /**
     * Get active programs
     */
    public function activePrograms()
    {
        return $this->programs()->wherePivot('status', 'active');
    }

    /**
     * Get inactive programs
     */
    public function inactivePrograms()
    {
        return $this->programs()->wherePivot('status', 'inactive');
    }

    /**
     * Check if enrolled in a program
     */
    public function isEnrolledIn($programId): bool
    {
        return $this->programs()->where('programs.id', $programId)->exists();
    }

    /**
     * Check if actively enrolled in a program
     */
    public function isActivelyEnrolledIn($programId): bool
    {
        return $this->activePrograms()->where('programs.id', $programId)->exists();
    }

    /**
     * Enroll in a program
     */
    public function enrollInProgram($programId, $status = 'active')
    {
        if ($this->isEnrolledIn($programId)) {
            return false;
        }

        // Generate program reference if member is already approved
        $programReference = null;
        if ($this->status === \App\Enums\MemberStatus::ACTIVE) {
            $referenceGenerator = new \App\Actions\GenerateRegistrationReferenceAction();
            $programReference = $referenceGenerator->execute($programId, $this->registration_date);
        }

        return $this->programs()->attach($programId, [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'enrolled_at' => now(),
            'status' => $status,
            'program_reference' => $programReference,
        ]);
    }

    /**
     * Unenroll from a program
     */
    public function unenrollFromProgram($programId)
    {
        return $this->programs()->detach($programId);
    }

    /**
     * Activate program enrollment
     */
    public function activateProgram($programId)
    {
        return $this->programs()->updateExistingPivot($programId, [
            'status' => 'active',
        ]);
    }

    /**
     * Deactivate program enrollment
     */
    public function deactivateProgram($programId)
    {
        return $this->programs()->updateExistingPivot($programId, [
            'status' => 'inactive',
        ]);
    }

    /**
     * Get total monthly fee for all active programs
     */
    public function getTotalMonthlyFeeAttribute()
    {
        return $this->activePrograms()->sum('monthly_fee');
    }

    /**
     * Get total admission fee for all programs
     */
    public function getTotalAdmissionFeeAttribute()
    {
        return $this->programs()->sum('admission_fee');
    }

    /**
     * Get programs count
     */
    public function getProgramsCountAttribute()
    {
        return $this->programs()->count();
    }

    /**
     * Get active programs count
     */
    public function getActiveProgramsCountAttribute()
    {
        return $this->activePrograms()->count();
    }

    /**
     * Get program names as array
     */
    public function getProgramNamesAttribute()
    {
        return $this->activePrograms()->pluck('name')->toArray();
    }
}
