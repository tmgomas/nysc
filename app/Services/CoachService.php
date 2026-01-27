<?php

namespace App\Services;

use App\Models\Coach;
use App\Models\Sport;
use Illuminate\Support\Facades\DB;

class CoachService
{
    /**
     * Create a new coach
     */
    public function create(array $data): Coach
    {
        return DB::transaction(function () use ($data) {
            $coach = Coach::create($data);

            // Assign to sports if provided
            if (!empty($data['sport_ids'])) {
                $coach->sports()->attach($data['sport_ids'], [
                    'assigned_at' => now(),
                ]);
            }

            return $coach;
        });
    }

    /**
     * Update coach
     */
    public function update(Coach $coach, array $data): Coach
    {
        return DB::transaction(function () use ($coach, $data) {
            $coach->update($data);

            // Update sport assignments if provided
            if (isset($data['sport_ids'])) {
                $coach->sports()->sync($data['sport_ids']);
            }

            return $coach->fresh();
        });
    }

    /**
     * Assign sports to coach
     */
    public function assignSports(Coach $coach, array $sportIds): Coach
    {
        $coach->sports()->sync($sportIds);
        return $coach->fresh();
    }

    /**
     * Get coach statistics
     */
    public function getStatistics(Coach $coach): array
    {
        $assignedSports = $coach->sports;
        $totalMembers = 0;
        $monthlyAttendance = 0;

        foreach ($assignedSports as $sport) {
            $totalMembers += $sport->members()->where('member_sports.status', 'active')->count();
            $monthlyAttendance += $sport->attendances()
                ->whereMonth('check_in_time', now()->month)
                ->count();
        }

        return [
            'assigned_sports_count' => $assignedSports->count(),
            'assigned_sports' => $assignedSports->pluck('name')->toArray(),
            'total_members' => $totalMembers,
            'monthly_attendance' => $monthlyAttendance,
            'experience_years' => $coach->experience_years,
            'specialization' => $coach->specialization,
        ];
    }

    /**
     * Get coaches for a sport
     */
    public function getCoachesForSport(Sport $sport)
    {
        return $sport->coaches()
            ->where('is_active', true)
            ->get();
    }

    /**
     * Activate coach
     */
    public function activate(Coach $coach): Coach
    {
        $coach->update(['is_active' => true]);
        return $coach->fresh();
    }

    /**
     * Deactivate coach
     */
    public function deactivate(Coach $coach): Coach
    {
        $coach->update(['is_active' => false]);
        return $coach->fresh();
    }
}
