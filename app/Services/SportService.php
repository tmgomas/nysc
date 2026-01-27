<?php

namespace App\Services;

use App\Models\Sport;
use App\Models\Coach;
use Illuminate\Support\Facades\DB;

class SportService
{
    /**
     * Create a new sport
     */
    public function create(array $data): Sport
    {
        return Sport::create($data);
    }

    /**
     * Update sport
     */
    public function update(Sport $sport, array $data): Sport
    {
        $sport->update($data);
        return $sport->fresh();
    }

    /**
     * Assign coaches to sport
     */
    public function assignCoaches(Sport $sport, array $coachIds): Sport
    {
        $sport->coaches()->sync($coachIds);
        
        // Log the assignment
        foreach ($coachIds as $coachId) {
            $coach = Coach::find($coachId);
            if ($coach) {
                $sport->activityLogs()->create([
                    'user_id' => auth()->id(),
                    'action' => 'coach_assigned',
                    'description' => "Coach {$coach->name} assigned to {$sport->name}",
                ]);
            }
        }

        return $sport->fresh();
    }

    /**
     * Get sport statistics
     */
    public function getStatistics(Sport $sport): array
    {
        return [
            'total_members' => $sport->members()->where('member_sports.status', 'active')->count(),
            'available_slots' => $sport->available_slots,
            'capacity_percentage' => $sport->capacity 
                ? round(($sport->members()->where('member_sports.status', 'active')->count() / $sport->capacity) * 100, 2)
                : null,
            'total_coaches' => $sport->coaches()->count(),
            'monthly_attendance' => $sport->attendances()
                ->whereMonth('check_in_time', now()->month)
                ->count(),
            'total_revenue' => $this->calculateRevenue($sport),
        ];
    }

    /**
     * Calculate revenue for sport
     */
    protected function calculateRevenue(Sport $sport): array
    {
        $activeMembers = $sport->members()->where('member_sports.status', 'active')->count();
        
        return [
            'admission_revenue' => $sport->admission_fee * $sport->members()->count(),
            'monthly_revenue' => $sport->monthly_fee * $activeMembers,
            'projected_annual' => $sport->monthly_fee * $activeMembers * 12,
        ];
    }

    /**
     * Check if sport has capacity
     */
    public function hasCapacity(Sport $sport): bool
    {
        if (!$sport->capacity) {
            return true; // Unlimited capacity
        }

        return $sport->available_slots > 0;
    }

    /**
     * Get popular sports (by member count)
     */
    public function getPopularSports(int $limit = 5): array
    {
        return Sport::withCount(['members' => function ($query) {
            $query->where('member_sports.status', 'active');
        }])
        ->orderByDesc('members_count')
        ->limit($limit)
        ->get()
        ->map(function ($sport) {
            return [
                'id' => $sport->id,
                'name' => $sport->name,
                'members_count' => $sport->members_count,
                'capacity' => $sport->capacity,
                'monthly_fee' => $sport->monthly_fee,
            ];
        })
        ->toArray();
    }
}
