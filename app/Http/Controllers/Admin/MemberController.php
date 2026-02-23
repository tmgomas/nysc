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
        protected \App\Services\MemberService $memberService,
        protected \App\Services\ScheduleService $scheduleService
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
                $cls->setAttribute('assigned_count', $assignedCount);
                $cls->setAttribute('available_spots', $cls->capacity ? max(0, $cls->capacity - $assignedCount) : null);
                $cls->setAttribute('is_full', $cls->capacity ? $assignedCount >= $cls->capacity : false);
                $cls->setAttribute('formatted_time', $cls->formatted_time);
                return $cls;
            });

        // Compute upcoming classes for the member using Service
        $scheduleData = $this->scheduleService->getUpcomingSchedule($member, 30);
        
        // Flatten the grouped results for the admin view which expects a flat list
        $upcomingClasses = collect($scheduleData['upcoming_classes'])
            ->pluck('classes')
            ->flatten(1)
            ->take(5);

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
            'program_ids' => 'required|array',
            'program_ids.*' => 'exists:programs,id',
        ]);

        $this->memberService->updatePrograms($member, $validated['program_ids']);

        return redirect()->back()
            ->with('success', 'Member programs updated successfully');
    }

    /**
     * Assign a member to a specific class slot
     */
    public function assignClass(Request $request)
    {
        $validated = $request->validate([
            'member_id'        => 'required|exists:members,id',
            'program_class_id' => 'required|exists:program_classes,id',
            'notes'            => 'nullable|string',
        ]);

        $member = Member::findOrFail($validated['member_id']);
        $class  = \App\Models\ProgramClass::findOrFail($validated['program_class_id']);

        // Must be enrolled in the program
        $isEnrolled = $member->programs()
            ->where('programs.id', $class->program_id)
            ->wherePivot('status', 'active')
            ->exists();

        if (!$isEnrolled) {
            return redirect()->back()->with('error', "Member is not enrolled in this program.");
        }

        // Check capacity
        if ($class->capacity && $class->assigned_count >= $class->capacity) {
            return redirect()->back()->with('error', "Class is at full capacity ({$class->capacity}).");
        }

        // Check not already assigned
        $alreadyAssigned = \App\Models\MemberProgramClass::where('member_id', $member->id)
            ->where('program_class_id', $class->id)
            ->exists();

        if ($alreadyAssigned) {
            return redirect()->back()->with('error', 'Member is already assigned to this class slot.');
        }

        \App\Models\MemberProgramClass::create([
            'member_id'        => $member->id,
            'program_class_id' => $class->id,
            'assigned_by'      => \Illuminate\Support\Facades\Auth::id(),
            'notes'            => $validated['notes'] ?? null,
            'status'           => 'active',
        ]);

        return redirect()->back()->with('success', "Member assigned to class successfully.");
    }

    /**
     * Remove member from a class slot
     */
    public function unassignClass(Request $request)
    {
        $validated = $request->validate([
            'member_id'        => 'required|exists:members,id',
            'program_class_id' => 'required|exists:program_classes,id',
        ]);

        \App\Models\MemberProgramClass::where('member_id', $validated['member_id'])
            ->where('program_class_id', $validated['program_class_id'])
            ->update(['status' => 'dropped']);

        return redirect()->back()->with('success', 'Member removed from class slot.');
    }
}
