<?php

namespace App\Services;

use App\Models\Coach;
use App\Models\Program;
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

            // Assign to programs if provided
            if (!empty($data['program_ids'])) {
                $coach->programs()->attach($data['program_ids'], [
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

            // Update program assignments if provided
            if (isset($data['program_ids'])) {
                $coach->programs()->sync($data['program_ids']);
            }

            return $coach->fresh();
        });
    }

    /**
     * Assign programs to coach
     */
    public function assignPrograms(Coach $coach, array $programIds): Coach
    {
        $coach->programs()->sync($programIds);
        return $coach->fresh();
    }

    /**
     * Get coach statistics
     */
    public function getStatistics(Coach $coach): array
    {
        $assignedPrograms = $coach->programs;
        $totalMembers = 0;
        $monthlyAttendance = 0;

        foreach ($assignedPrograms as $program) {
            $totalMembers += $program->members()->where('member_programs.status', 'active')->count();
            $monthlyAttendance += $program->attendances()
                ->whereMonth('check_in_time', now()->month)
                ->count();
        }

        return [
            'assigned_programs_count' => $assignedPrograms->count(),
            'assigned_programs' => $assignedPrograms->pluck('name')->toArray(),
            'total_members' => $totalMembers,
            'monthly_attendance' => $monthlyAttendance,
            'experience_years' => $coach->experience_years,
            'specialization' => $coach->specialization,
        ];
    }

    /**
     * Get coaches for a program
     */
    public function getCoachesForProgram(Program $program)
    {
        return $program->coaches()
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

    /**
     * Get dashboard data for coach
     */
    public function getDashboardData(Coach $coach): array
    {
        $programIds = $coach->programs()->pluck('programs.id');

        $todayAttendanceCount = \App\Models\Attendance::whereIn('program_id', $programIds)
            ->whereDate('check_in_time', today())
            ->count();

        $programs = Program::whereIn('id', $programIds)
            ->withCount(['members' => fn ($q) => $q->where('member_programs.status', 'active')])
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'short_code' => $p->short_code,
                'active_members_count' => $p->members_count,
            ]);

        return [
            'today_attendance_count' => $todayAttendanceCount,
            'programs' => $programs,
        ];
    }

    /**
     * Get today's classes for coach
     */
    public function getTodayClasses(Coach $coach): array
    {
        $programIds = $coach->programs()->pluck('programs.id');
        $todayName = strtolower(now()->format('l'));

        $classes = \App\Models\ProgramClass::whereIn('program_id', $programIds)
            ->where('is_active', true)
            ->where('day_of_week', $todayName)
            ->with('program')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'program_name' => $c->program->name,
                'start_time' => $c->start_time,
                'end_time' => $c->end_time,
            ]);

        return [
            'classes' => $classes,
        ];
    }
}
