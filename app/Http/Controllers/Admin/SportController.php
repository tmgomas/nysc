<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coach;
use Illuminate\Http\Request;

class SportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sports = \App\Models\Sport::query()
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
                $query->where('member_sports.status', 'active');
            }, 'classes'])
            ->with(['classes' => function ($query) {
                $query->where('is_active', true)->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")->orderBy('start_time');
            }])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return \Inertia\Inertia::render('Admin/Sports/Index', [
            'sports' => $sports,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $coaches = Coach::active()->select('id', 'name', 'specialization')->get();

        return \Inertia\Inertia::render('Admin/Sports/Create', [
            'coaches' => $coaches,
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
            'location' => 'nullable|string|max:255',
            'schedule' => 'nullable|array',
            'schedule_type' => 'required|in:class_based,practice_days',
            'weekly_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $sport = \App\Models\Sport::create($validated);

        // For class-based sports, redirect to edit page so they can add classes immediately
        if ($validated['schedule_type'] === 'class_based') {
            return redirect()->route('admin.sports.edit', $sport)
                ->with('success', 'Sport created successfully. Now add class time slots below.');
        }

        return redirect()->route('admin.sports.index')
            ->with('success', 'Sport created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(\App\Models\Sport $sport)
    {
        // Not implemented (Index or Edit usually sufficient)
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(\App\Models\Sport $sport)
    {
        $sport->load(['classes' => function ($query) {
            $query->with('coach:id,name')->orderByRaw("FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')")->orderBy('start_time');
        }]);

        $coaches = Coach::active()->select('id', 'name', 'specialization')->get();

        return \Inertia\Inertia::render('Admin/Sports/Edit', [
            'sport' => $sport,
            'coaches' => $coaches,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\Sport $sport)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_code' => 'nullable|string|max:10|unique:sports,short_code,' . $sport->id,
            'description' => 'nullable|string',
            'admission_fee' => 'required|numeric|min:0',
            'monthly_fee' => 'required|numeric|min:0',
            'capacity' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:255',
            'schedule' => 'nullable|array',
            'schedule_type' => 'required|in:class_based,practice_days',
            'weekly_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'update_existing_schedules' => 'boolean',
        ]);

        $oldMonthlyFee = $sport->monthly_fee;
        
        // Remove the extra field before update
        $updateData = collect($validated)->except('update_existing_schedules')->toArray();
        $sport->update($updateData);

        // Logic: ONLY update pending schedules if the user explicitly agreed (checked the box)
        if ($oldMonthlyFee != $sport->monthly_fee && $request->boolean('update_existing_schedules')) {
            \App\Models\MemberPaymentSchedule::where('sport_id', $sport->id)
                ->where('status', 'pending')
                ->where('due_date', '>', now()) // Only future or current pending dues
                ->whereNull('payment_id') // Ensure it hasn't been part of a payment attempt
                ->update(['amount' => $sport->monthly_fee]);
        }

        return redirect()->route('admin.sports.index')
            ->with('success', 'Sport updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\Sport $sport)
    {
        if ($sport->members()->exists()) {
             return back()->with('error', 'Cannot delete sport with active members info. Deactivate it instead.');
        }

        $sport->delete();

        return redirect()->route('admin.sports.index')
            ->with('success', 'Sport deleted successfully.');
    }
}
