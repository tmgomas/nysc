<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Services\MemberService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function __construct(
        protected MemberService $memberService
    ) {}

    public function index(Request $request)
    {
        $members = Member::with(['user', 'programs'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->search, fn($q, $search) => 
                $q->where('member_number', 'like', "%{$search}%")
                  ->orWhere('nic_passport', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('calling_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            )
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        $programs = \App\Models\Program::where('is_active', true)
            ->select('id', 'name', 'admission_fee', 'monthly_fee')
            ->get();

        return Inertia::render('Admin/Members/Create', [
            'programs' => $programs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Personal
            'full_name' => 'required|string|max:255',
            'calling_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:members|max:255',
            'nic_passport' => 'nullable|string|unique:members',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'required|string',
            'address' => 'required|string',

            // Medical
            'blood_group' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'allergies' => 'nullable|string',

            // Emergency & Guardian
            'emergency_contact' => 'required|string',
            'emergency_number' => 'required|string',
            'guardian_name' => 'nullable|string',
            'guardian_nic' => 'nullable|string',
            'guardian_relationship' => 'nullable|string',

            // Background & Preferences
            'school_occupation' => 'nullable|string',
            'membership_type' => 'required|in:regular,student,senior',
            'fitness_level' => 'required|in:beginner,intermediate,advanced',
            'jersey_size' => 'nullable|string',
            'preferred_contact_method' => 'required|string',
            'referral_source' => 'nullable|string',
            'preferred_training_days' => 'nullable|array',
            'previous_club_experience' => 'nullable|string',

            // Programs & Legal
            'program_ids' => 'nullable|array',
            'terms_accepted' => 'accepted',
            'photo_consent' => 'boolean',
        ]);
        
        // Add timestamps for consents
        if ($request->terms_accepted) {
            $validated['terms_accepted_at'] = now();
        }
        if ($request->photo_consent) {
            $validated['photo_consent_at'] = now();
        }

        $member = $this->memberService->register($validated);

        return redirect()->route('admin.members.show', $member)
            ->with('success', 'Member registered successfully');
    }

    public function show(Member $member)
    {
        $member->load([
            'user',
            'programs.location',
            'payments.program',
            'payments.items.program',
            'attendances',
            'paymentSchedules.program',
            'programClasses.programClass.program',
            'programClasses.programClass.coach',
            'absences.programClass.program',
            'absences.makeupClass',
        ]);

        $stats = $this->memberService->getStatistics($member);

        // Available class slots from member's enrolled programs (for assignment)
        $enrolledProgramIds = $member->programs()
            ->wherePivot('status', 'active')
            ->pluck('programs.id');

        $availableClasses = \App\Models\ProgramClass::with(['program', 'coach'])
            ->whereIn('program_id', $enrolledProgramIds)
            ->where('is_active', true)
            ->get()
            ->map(function ($cls) {
                $assignedCount = $cls->assignedMembers()->count();
                $makeupCount   = \App\Models\ClassAbsence::where('makeup_class_id', $cls->id)
                    ->whereIn('status', ['makeup_selected', 'completed'])
                    ->count();
                $cls->setAttribute('assigned_count', $assignedCount);
                $cls->setAttribute('available_spots', $cls->capacity ? max(0, $cls->capacity - $assignedCount - $makeupCount) : null);
                $cls->setAttribute('is_full', $cls->capacity ? ($assignedCount + $makeupCount) >= $cls->capacity : false);
                $cls->setAttribute('formatted_time', $cls->formatted_time);
                return $cls;
            });

        // Compute upcoming classes for the member
        $now = \Carbon\Carbon::now();
        $upcomingClasses = collect();
        $classIds = $member->programClasses->where('status', 'active')->pluck('program_class_id')->unique();

        $cancellations = \App\Models\ClassCancellation::whereIn('program_class_id', $classIds)
            ->where('cancelled_date', '>=', $now->toDateString())
            ->get()
            ->groupBy(function($item) {
                return $item->program_class_id . '_' . $item->cancelled_date->toDateString();
            });

        $holidays = \App\Models\Holiday::where('date', '>=', $now->copy()->subYear()->toDateString())->get();
        $holidayDates = collect();
        for($i=0; $i<60; $i++) {
            $checkDate = $now->copy()->addDays($i);
            $isHoliday = $holidays->contains(function ($h) use ($checkDate) {
                if ($h->date->toDateString() === $checkDate->toDateString()) return true;
                if ($h->is_recurring && $h->date->month === $checkDate->month && $h->date->day === $checkDate->day) return true;
                return false;
            });
            if ($isHoliday) {
                $holidayDates->push($checkDate->toDateString());
            }
        }

        foreach ($member->programClasses->where('status', 'active') as $memberClass) {
            $cls = $memberClass->programClass;
            if (!$cls || !$cls->is_active) continue;
            
            $dayOfWeek = strtolower($cls->day_of_week);
            $classTime = \Carbon\Carbon::parse($cls->start_time);
            $nextDate = \Carbon\Carbon::parse("next " . $dayOfWeek);
            
            if (strtolower($now->englishDayOfWeek) === $dayOfWeek) {
                if ($classTime->format('H:i:s') > $now->format('H:i:s')) {
                    $nextDate = \Carbon\Carbon::today();
                }
            }
            
            $found = 0;
            $checkDate = $nextDate->copy();
            
            while($found < 4 && $checkDate->diffInDays($now) <= 60) {
                $dateStr = $checkDate->toDateString();
                $isCancelled = $cancellations->has($cls->id . '_' . $dateStr);
                $isHoliday = $holidayDates->contains($dateStr);
                
                if (!$isCancelled && (!$isHoliday || ($isHoliday && false /* optionally could check if program ignores holidays */ ))) {
                    if (!$isHoliday) {
                       $upcomingClasses->push([
                           'id' => $cls->id . '-' . $dateStr,
                           'program_class_id' => $cls->id,
                           'program_name' => $cls->program->name,
                           'label' => $cls->label ?? $cls->day_of_week,
                           'day_of_week' => $cls->day_of_week,
                           'date' => $dateStr,
                           'start_time' => $cls->start_time,
                           'end_time' => $cls->end_time,
                           'formatted_time' => $cls->formatted_time,
                           'coach_name' => $cls->coach ? $cls->coach->name : null,
                       ]);
                       $found++;
                    }
                }
                
                $checkDate->addWeek();
            }
        }
        
        $upcomingClasses = $upcomingClasses->sortBy(function($item) {
            return $item['date'] . ' ' . $item['start_time'];
        })->values()->take(5);

        return Inertia::render('Admin/Members/Show', [
            'member'            => $member,
            'stats'             => $stats,
            'availablePrograms' => \App\Models\Program::where('is_active', true)->select('id', 'name', 'monthly_fee')->get(),
            'availableClasses'  => $availableClasses,
            'upcomingClasses'   => $upcomingClasses,
        ]);
    }


    public function approve(Member $member)
    {
        $result = $this->memberService->approveAndCreateAccount($member);

        return redirect()->back()
            ->with('success', 'Member approved and account created');
    }

    public function suspend(Request $request, Member $member)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $this->memberService->suspend($member, $validated['reason']);

        return redirect()->back()
            ->with('success', 'Member suspended');
    }

    public function reactivate(Member $member)
    {
        $this->memberService->reactivate($member);

        return redirect()->back()
            ->with('success', 'Member reactivated successfully');
    }

    public function updatePrograms(Request $request, Member $member)
    {
        $validated = $request->validate([
            'program_ids' => 'required|array', // Allow empty array if they want to remove all? No, logical min 1 usually, but let's stick to array.
            'program_ids.*' => 'exists:programs,id',
        ]);

        $this->memberService->updatePrograms($member, $validated['program_ids']);

        return redirect()->back()
            ->with('success', 'Member programs updated successfully');
    }
}
