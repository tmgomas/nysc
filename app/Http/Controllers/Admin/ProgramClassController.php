<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramClass;
use App\Models\ClassCancellation;
use Illuminate\Http\Request;

class ProgramClassController extends Controller
{
    /**
     * Store a new class/time slot for a program.
     * Supports multi-day creation (creates one row per day).
     */
    public function store(Request $request, Program $program)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'days' => 'required|array|min:1',
            'days.*' => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'coach_id' => 'nullable|exists:coaches,id',
            'capacity' => 'nullable|integer|min:1',
            'recurrence' => 'nullable|in:weekly,monthly,term',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
        ]);

        $created = [];
        foreach ($validated['days'] as $day) {
            $created[] = $program->classes()->create([
                'label' => $validated['label'] ?? null,
                'day_of_week' => $day,
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'coach_id' => $validated['coach_id'] ?? null,
                'capacity' => $validated['capacity'] ?? null,
                'recurrence' => $validated['recurrence'] ?? 'weekly',
                'valid_from' => $validated['valid_from'] ?? null,
                'valid_to' => $validated['valid_to'] ?? null,
            ]);
        }

        return back()->with('success', count($created) . ' class slot(s) created successfully.');
    }

    /**
     * Update an existing class/time slot.
     */
    public function update(Request $request, Program $program, ProgramClass $class)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'coach_id' => 'nullable|exists:coaches,id',
            'capacity' => 'nullable|integer|min:1',
            'recurrence' => 'nullable|in:weekly,monthly,term',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after_or_equal:valid_from',
            'is_active' => 'boolean',
        ]);

        $class->update($validated);

        return back()->with('success', 'Class slot updated successfully.');
    }

    /**
     * Delete a class/time slot.
     */
    public function destroy(Program $program, ProgramClass $class)
    {
        $class->delete();

        return back()->with('success', 'Class slot deleted successfully.');
    }

    /**
     * Toggle active/inactive status.
     */
    public function toggleActive(Program $program, ProgramClass $class)
    {
        $class->update(['is_active' => !$class->is_active]);

        $status = $class->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Class slot {$status} successfully.");
    }

    /**
     * Cancel a specific date occurrence.
     */
    public function cancelDate(Request $request, Program $program, ProgramClass $class)
    {
        $validated = $request->validate([
            'cancelled_date' => 'required|date',
            'reason' => 'nullable|string|max:255',
        ]);

        $class->cancellations()->firstOrCreate(
            ['cancelled_date' => $validated['cancelled_date']],
            ['reason' => $validated['reason'] ?? null]
        );

        return back()->with('success', 'Date cancelled successfully.');
    }

    /**
     * Restore a cancelled date.
     */
    public function restoreDate(Program $program, ProgramClass $class, ClassCancellation $cancellation)
    {
        $cancellation->delete();

        return back()->with('success', 'Date restored successfully.');
    }
}
