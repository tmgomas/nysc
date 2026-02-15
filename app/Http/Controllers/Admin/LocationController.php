<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::withCount(['programs', 'specialBookings'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Locations/Index', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:locations,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Location::create($validated);

        return back()->with('success', 'Location created successfully.');
    }

    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:locations,name,' . $location->id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $location->update($validated);

        return back()->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        if ($location->programs()->count() > 0) {
            return back()->with('error', 'Cannot delete location with assigned sports.');
        }

        $location->delete();

        return back()->with('success', 'Location deleted successfully.');
    }
}
