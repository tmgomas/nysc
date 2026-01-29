<?php

namespace App\Traits;

use App\Models\Sport;
use App\Models\MemberSport;

trait HasSports
{
    /**
     * Get all sports for this member
     */
    public function sports()
    {
        return $this->belongsToMany(Sport::class, 'member_sports')
            ->using(MemberSport::class)
            ->withPivot('enrolled_at', 'status', 'sport_reference')
            ->withTimestamps();
    }

    /**
     * Get active sports
     */
    public function activeSports()
    {
        return $this->sports()->wherePivot('status', 'active');
    }

    /**
     * Get inactive sports
     */
    public function inactiveSports()
    {
        return $this->sports()->wherePivot('status', 'inactive');
    }

    /**
     * Check if enrolled in a sport
     */
    public function isEnrolledIn($sportId): bool
    {
        return $this->sports()->where('sports.id', $sportId)->exists();
    }

    /**
     * Check if actively enrolled in a sport
     */
    public function isActivelyEnrolledIn($sportId): bool
    {
        return $this->activeSports()->where('sports.id', $sportId)->exists();
    }

    /**
     * Enroll in a sport
     */
    public function enrollInSport($sportId, $status = 'active')
    {
        if ($this->isEnrolledIn($sportId)) {
            return false;
        }

        // Generate sport reference if member is already approved
        $sportReference = null;
        if ($this->status === \App\Enums\MemberStatus::ACTIVE) {
            $referenceGenerator = new \App\Actions\GenerateRegistrationReferenceAction();
            $sportReference = $referenceGenerator->execute($sportId, $this->registration_date);
        }

        return $this->sports()->attach($sportId, [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'enrolled_at' => now(),
            'status' => $status,
            'sport_reference' => $sportReference,
        ]);
    }

    /**
     * Unenroll from a sport
     */
    public function unenrollFromSport($sportId)
    {
        return $this->sports()->detach($sportId);
    }

    /**
     * Activate sport enrollment
     */
    public function activateSport($sportId)
    {
        return $this->sports()->updateExistingPivot($sportId, [
            'status' => 'active',
        ]);
    }

    /**
     * Deactivate sport enrollment
     */
    public function deactivateSport($sportId)
    {
        return $this->sports()->updateExistingPivot($sportId, [
            'status' => 'inactive',
        ]);
    }

    /**
     * Get total monthly fee for all active sports
     */
    public function getTotalMonthlyFeeAttribute()
    {
        return $this->activeSports()->sum('monthly_fee');
    }

    /**
     * Get total admission fee for all sports
     */
    public function getTotalAdmissionFeeAttribute()
    {
        return $this->sports()->sum('admission_fee');
    }

    /**
     * Get sports count
     */
    public function getSportsCountAttribute()
    {
        return $this->sports()->count();
    }

    /**
     * Get active sports count
     */
    public function getActiveSportsCountAttribute()
    {
        return $this->activeSports()->count();
    }

    /**
     * Get sport names as array
     */
    public function getSportNamesAttribute()
    {
        return $this->activeSports()->pluck('name')->toArray();
    }
}
