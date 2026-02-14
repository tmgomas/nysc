<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SpecialBooking;
use App\Models\Location;
use Illuminate\Http\Request;

class SpecialBookingController extends Controller
{
    public function index(Request $request)
    {
        $bookings = SpecialBooking::with('location:id,name')
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'location_id' => 'required|exists:locations,id',
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'reason' => 'nullable|string|max:1000',
            'cancels_classes' => 'boolean',
        ]);

        SpecialBooking::create($validated);

        return back()->with('success', 'Special booking created successfully.');
    }

    public function destroy(SpecialBooking $specialBooking)
    {
        $specialBooking->delete();

        return back()->with('success', 'Special booking removed successfully.');
    }
}
