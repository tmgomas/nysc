<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coach;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $programs = \App\Models\Program::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            })
            ->when($request->has('status'), function ($query) use ($request) {
                if ($request->status !== 'all') {
                    $query->where('is_active', $request->status === 'active');
                }
            })
            ->withCount(['members' => function ($query) {
                $query->where('member_programs.status', 'active');
            }, 'classes'])
            ->with(['classes' => function ($query) {
                $query->where('is_active', true)->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")->orderBy('start_time');
            }])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return \Inertia\Inertia::render('Admin/Programs/Index', [
            'programs' => $programs,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $coaches = Coach::active()->select('id', 'name', 'specialization')->get();
        $locations = \App\Models\Location::active()->orderBy('name')->get(['id', 'name']);

        return \Inertia\Inertia::render('Admin/Programs/Create', [
            'coaches' => $coaches,
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_code' => 'nullable|string|max:10|unique:sports,short_code',
            'description' => 'nullable|string',
            'admission_fee' => 'required|numeric|min:0',
            'monthly_fee' => 'required|numeric|min:0',
            'capacity' => 'nullable|integer|min:1',
            'location_id' => 'nullable|exists:locations,id',
            'schedule' => 'nullable|array',
            'schedule_type' => 'required|in:class_based,practice_days',
            'weekly_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $program = \App\Models\Program::create($validated);

        // For class-based sports, redirect to edit page so they can add classes immediately
        if ($validated['schedule_type'] === 'class_based') {
            return redirect()->route('admin.sports.edit', $program)
                ->with('success', 'Program created successfully. Now add class time slots below.');
        }

        return redirect()->route('admin.sports.index')
            ->with('success', 'Program created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(\App\Models\Program $program)
    {
        // Not implemented (Index or Edit usually sufficient)
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(\App\Models\Program $program)
    {
        $program->load(['classes' => function ($query) {
            $query->with('coach:id,name', 'cancellations')->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")->orderBy('start_time');
        }, 'location:id,name']);

        $coaches = Coach::active()->select('id', 'name', 'specialization')->get();
        $locations = \App\Models\Location::active()->orderBy('name')->get(['id', 'name']);

        return \Inertia\Inertia::render('Admin/Programs/Edit', [
            'program' => $program,
            'coaches' => $coaches,
            'locations' => $locations,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\Program $program)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_code' => 'nullable|string|max:10|unique:sports,short_code,' . $program->id,
            'description' => 'nullable|string',
            'admission_fee' => 'required|numeric|min:0',
            'monthly_fee' => 'required|numeric|min:0',
            'capacity' => 'nullable|integer|min:1',
            'location_id' => 'nullable|exists:locations,id',
            'schedule' => 'nullable|array',
            'schedule_type' => 'required|in:class_based,practice_days',
            'weekly_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'update_existing_schedules' => 'boolean',
        ]);

        $oldMonthlyFee = $program->monthly_fee;
        
        // Remove the extra field before update
        $updateData = collect($validated)->except('update_existing_schedules')->toArray();
        $program->update($updateData);

        // Logic: ONLY update pending schedules if the user explicitly agreed (checked the box)
        if ($oldMonthlyFee != $program->monthly_fee && $request->boolean('update_existing_schedules')) {
            \App\Models\MemberPaymentSchedule::where('program_id', $program->id)
                ->where('status', 'pending')
                ->where('due_date', '>', now()) // Only future or current pending dues
                ->whereNull('payment_id') // Ensure it hasn't been part of a payment attempt
                ->update(['amount' => $program->monthly_fee]);
        }

        return redirect()->route('admin.sports.index')
            ->with('success', 'Program updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Program $program)
    {
        if ($program->members()->exists()) {
             return back()->with('error', 'Cannot delete program with active members info. Deactivate it instead.');
        }

        $program->delete();

        return redirect()->route('admin.sports.index')
            ->with('success', 'Program deleted successfully.');
    }
}
