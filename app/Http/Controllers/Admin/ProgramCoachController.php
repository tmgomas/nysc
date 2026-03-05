<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Coach;
use Illuminate\Http\Request;

class ProgramCoachController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Program $program)
    {
        $validated = $request->validate([
            'coach_id' => 'required|exists:coaches,id',
        ]);

        if ($program->coaches()->where('coach_id', $validated['coach_id'])->exists()) {
             return back()->with('error', 'Coach is already assigned to this program.');
        }

        $program->coaches()->attach($validated['coach_id'], ['id' => \Illuminate\Support\Str::uuid()]);

        return back()->with('success', 'Coach assigned to program successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Program $program, Coach $coach)
    {
        $program->coaches()->detach($coach->id);

        // Also check if they are assigned to any future classes and remove them?
        // Or leave that to manual? Depending on requirements, we'll keep it simple for now.

        return back()->with('success', 'Coach removed from program successfully.');
    }
}
