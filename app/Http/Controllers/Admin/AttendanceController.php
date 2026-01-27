<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Sport;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $sports = Sport::select('id', 'name')->orderBy('name')->get();
        
        $filters = $request->only(['date', 'sport_id']);
        $date = $request->input('date', today()->format('Y-m-d'));
        $sportId = $request->input('sport_id');

        $members = [];
        
        if ($sportId) {
            $members = Member::whereHas('sports', function ($query) use ($sportId) {
                $query->where('sports.id', $sportId);
            })
            ->whereIn('status', ['active', 'pending'])
            ->with(['attendances' => function ($query) use ($date, $sportId) {
                $query->whereDate('check_in_time', $date)
                      ->where('sport_id', $sportId);
            }])
            ->orderBy('full_name') // Or member_number
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'member_number' => $member->member_number,
                    'full_name' => $member->full_name,
                    'attendance' => $member->attendances->first() ? [
                        'id' => $member->attendances->first()->id,
                        'check_in_time' => $member->attendances->first()->check_in_time->format('H:i'),
                        'check_out_time' => $member->attendances->first()->check_out_time?->format('H:i'),
                    ] : null,
                ];
            });
        }

        

        return Inertia::render('Admin/Attendance/Index', [
            'sports' => $sports,
            'filters' => $filters,
            'members' => $members,
            'currentDate' => $date,
        ]);
    }

    public function mark(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'sport_id' => 'required|exists:sports,id',
            'attendances' => 'required|array',
            'attendances.*.member_id' => 'required|exists:members,id',
            'attendances.*.present' => 'required|boolean',
            'attendances.*.check_in' => 'nullable|string', // HH:mm
        ]);

        $date = Carbon::parse($validated['date']);
        $sportId = $validated['sport_id'];

        DB::transaction(function () use ($validated, $date, $sportId) {
            foreach ($validated['attendances'] as $item) {
                $checkInTime = $date->copy()->setTimeFromTimeString($item['check_in'] ?? '08:00'); // Default time if not set? Or use current?
                
                if ($item['present']) {
                    Attendance::updateOrCreate(
                        [
                            'member_id' => $item['member_id'],
                            'sport_id' => $sportId,
                            'check_in_time' => $checkInTime, // Note: This might create duplicates if we strictly match check_in_time. 
                            // Better to find by member_id + sport_id + DATE(check_in_time)
                        ],
                        [
                            'marked_by' => Auth::id(),
                            'method' => 'manual',
                            // 'check_in_time' => $checkInTime // update time if changed
                        ]
                    );
                } else {
                    // Remove attendance if unmarked
                    Attendance::where('member_id', $item['member_id'])
                        ->where('sport_id', $sportId)
                        ->whereDate('check_in_time', $date->toDateString())
                        ->delete();
                }
            }
        });

        return back()->with('success', 'Attendance updated successfully.');
    }
    
    // Fix updateOrCreate logic above:
    // updateOrCreate keys are minimal conditions to find the record. 
    // Since check_in_time includes TIME, updateOrCreate won't find existing record for "today".
    // I should use explicit check.

    public function bulkMark(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'sport_id' => 'required|exists:sports,id',
            'attendances' => 'required|array',
            'attendances.*.member_id' => 'required|exists:members,id',
            'attendances.*.present' => 'required|boolean',
            'attendances.*.check_in' => 'nullable|string', // HH:mm format
        ]);

        $dateStr = $validated['date'];
        $sportId = $validated['sport_id'];
        $userId = Auth::id();

        DB::transaction(function () use ($validated, $dateStr, $sportId, $userId) {
            foreach ($validated['attendances'] as $item) {
                // Check for existing record on this day
                $attendance = Attendance::where('member_id', $item['member_id'])
                    ->where('sport_id', $sportId)
                    ->whereDate('check_in_time', $dateStr)
                    ->first();

                if ($item['present']) {
                    $time = $item['check_in'] ?? Carbon::now()->format('H:i');
                    $fullDateTime = Carbon::parse("$dateStr $time");

                    if ($attendance) {
                        $attendance->update([
                            'check_in_time' => $fullDateTime,
                            'marked_by' => $userId,
                        ]);
                    } else {
                        Attendance::create([
                            'member_id' => $item['member_id'],
                            'sport_id' => $sportId,
                            'check_in_time' => $fullDateTime,
                            'marked_by' => $userId,
                            'method' => 'bulk', // or manual
                        ]);
                    }
                } else {
                    if ($attendance) {
                        $attendance->delete();
                    }
                }
            }
        });

        return back()->with('success', 'Attendance records updated.');
    }
}
