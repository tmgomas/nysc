<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\MemberResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        protected \App\Services\MemberService $memberService
    ) {}

    public function show(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $member->load(['programs.location']);

        return response()->json([
            'member' => new MemberResource($member),
        ]);
    }

    public function update(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $validated = $request->validate([
            'contact_number' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',
            'emergency_contact' => 'sometimes|string|max:255',
            'emergency_number' => 'sometimes|string|max:20',
            'blood_group' => 'sometimes|string|max:10',
            'jersey_size' => 'sometimes|string|max:10',
        ]);

        $member = $this->memberService->updateProfile($member, $validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'member' => new MemberResource($member->load(['programs.location'])),
        ]);
    }
}
