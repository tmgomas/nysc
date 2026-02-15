<?php

namespace App\Services;

use App\Models\Program;
use App\Models\Coach;
use Illuminate\Support\Facades\DB;

class ProgramService
{
    /**
     * Create a new program
     */
    public function create(array $data): Program
    {
        return Program::create($data);
    }

    /**
     * Update program
     */
    public function update(Program $program, array $data): Program
    {
        $program->update($data);
        return $program->fresh();
    }

    /**
     * Assign coaches to program
     */
    public function assignCoaches(Program $program, array $coachIds): Program
    {
        $program->coaches()->sync($coachIds);
        
        // Log the assignment
        foreach ($coachIds as $coachId) {
            $coach = Coach::find($coachId);
            if ($coach) {
                $program->activityLogs()->create([
                    'user_id' => auth()->id(),
                    'action' => 'coach_assigned',
                    'description' => "Coach {$coach->name} assigned to {$program->name}",
                ]);
            }
        }

        return $program->fresh();
    }

    /**
     * Get program statistics
     */
    public function getStatistics(Program $program): array
    {
        return [
            'total_members' => $program->members()->where('member_programs.status', 'active')->count(),
            'available_slots' => $program->available_slots,
            'capacity_percentage' => $program->capacity 
                ? round(($program->members()->where('member_programs.status', 'active')->count() / $program->capacity) * 100, 2)
                : null,
            'total_coaches' => $program->coaches()->count(),
            'monthly_attendance' => $program->attendances()
                ->whereMonth('check_in_time', now()->month)
                ->count(),
            'total_revenue' => $this->calculateRevenue($program),
        ];
    }

    /**
     * Calculate revenue for program
     */
    protected function calculateRevenue(Program $program): array
    {
        $activeMembers = $program->members()->where('member_programs.status', 'active')->count();
        
        return [
            'admission_revenue' => $program->admission_fee * $program->members()->count(),
            'monthly_revenue' => $program->monthly_fee * $activeMembers,
            'projected_annual' => $program->monthly_fee * $activeMembers * 12,
        ];
    }

    /**
     * Check if program has capacity
     */
    public function hasCapacity(Program $program): bool
    {
        if (!$program->capacity) {
            return true; // Unlimited capacity
        }

        return $program->available_slots > 0;
    }

    /**
     * Get popular programs (by member count)
     */
    public function getPopularPrograms(int $limit = 5): array
    {
        return Program::withCount(['members' => function ($query) {
            $query->where('member_programs.status', 'active');
        }])
        ->orderByDesc('members_count')
        ->limit($limit)
        ->get()
        ->map(function ($program) {
            return [
                'id' => $program->id,
                'name' => $program->name,
                'members_count' => $program->members_count,
                'capacity' => $program->capacity,
                'monthly_fee' => $program->monthly_fee,
            ];
        })
        ->toArray();
    }
}
