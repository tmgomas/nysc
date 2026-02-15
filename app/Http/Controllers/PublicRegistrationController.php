<?php

namespace App\Http\Controllers;

use App\Services\MemberService;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicRegistrationController extends Controller
{
    public function __construct(
        protected MemberService $memberService
    ) {}

    public function create()
    {
        $programs = Program::where('is_active', true)->get();

        return Inertia::render('Public/Registration', [
            'programs' => $programs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nic_passport' => 'required|unique:members',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'required|string',
            'address' => 'required|string',
            'emergency_contact' => 'required|string',
            'emergency_number' => 'required|string',
            'program_ids' => 'required|array|min:1',
            'program_ids.*' => 'exists:sports,id',
        ]);

        $member = $this->memberService->register($validated);

        return redirect()->route('registration.success')
            ->with('success', 'Registration submitted successfully. Your member number is: ' . $member->member_number);
    }

    public function success()
    {
        return Inertia::render('Public/RegistrationSuccess');
    }
}
