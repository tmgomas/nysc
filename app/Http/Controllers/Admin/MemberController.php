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
        $members = Member::with(['user', 'sports'])
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
        $sports = \App\Models\Sport::where('is_active', true)
            ->select('id', 'name', 'admission_fee', 'monthly_fee')
            ->get();

        return Inertia::render('Admin/Members/Create', [
            'sports' => $sports,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Personal
            'full_name' => 'required|string|max:255',
            'calling_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:members|max:255',
            'nic_passport' => 'required|string|unique:members',
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

            // Sports & Legal
            'sport_ids' => 'required|array|min:1',
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
        $member->load(['user', 'sports', 'payments.sport', 'payments.items.sport', 'attendances', 'paymentSchedules.sport']);
        $stats = $this->memberService->getStatistics($member);

        return Inertia::render('Admin/Members/Show', [
            'member' => $member,
            'stats' => $stats,
            'availableSports' => \App\Models\Sport::where('is_active', true)->select('id', 'name', 'monthly_fee')->get(),
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

    public function updateSports(Request $request, Member $member)
    {
        $validated = $request->validate([
            'sport_ids' => 'required|array', // Allow empty array if they want to remove all? No, logical min 1 usually, but let's stick to array.
            'sport_ids.*' => 'exists:sports,id',
        ]);

        $this->memberService->updateSports($member, $validated['sport_ids']);

        return redirect()->back()
            ->with('success', 'Member sports updated successfully');
    }
}
