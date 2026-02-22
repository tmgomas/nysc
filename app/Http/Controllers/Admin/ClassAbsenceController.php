<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Member, ProgramClass, ClassAbsence, MemberProgramClass};
use App\Services\ClassAbsenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClassAbsenceController extends Controller
{
    public function __construct(
        protected ClassAbsenceService $absenceService
    ) {}

    /**
     * Admin: list all absence requests
     */
    public function index(Request $request)
    {
        $absences = ClassAbsence::with([
                'member',
                'programClass.program',
                'makeupClass',
                'approvedBy',
            ])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->program_id, fn($q, $p) => $q->whereHas('programClass', fn($q2) => $q2->where('program_id', $p)))
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/ClassAbsences/Index', [
            'absences' => $absences,
            'filters'  => $request->only(['status', 'program_id']),
        ]);
    }

    /**
     * Admin: approve an absence
     */
    public function approve(Request $request, ClassAbsence $absence)
    {
        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $this->absenceService->approve($absence, $validated['admin_notes'] ?? null);

        return redirect()->back()->with('success', 'Absence approved. Member has 7 days to select a makeup class.');
    }

    /**
     * Admin: reject an absence
     */
    public function reject(Request $request, ClassAbsence $absence)
    {
        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $this->absenceService->reject($absence, $validated['admin_notes'] ?? null);

        return redirect()->back()->with('success', 'Absence request rejected.');
    }

    // ─── Class Assignments ───────────────────────────────────────────────────

    /**
     * Assign a member to a specific class slot
     */
    public function assignMember(Request $request)
    {
        $validated = $request->validate([
            'member_id'        => 'required|exists:members,id',
            'program_class_id' => 'required|exists:program_classes,id',
            'notes'            => 'nullable|string',
        ]);

        $member = Member::findOrFail($validated['member_id']);
        $class  = ProgramClass::findOrFail($validated['program_class_id']);

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
        $alreadyAssigned = MemberProgramClass::where('member_id', $member->id)
            ->where('program_class_id', $class->id)
            ->exists();

        if ($alreadyAssigned) {
            return redirect()->back()->with('error', 'Member is already assigned to this class slot.');
        }

        MemberProgramClass::create([
            'member_id'        => $member->id,
            'program_class_id' => $class->id,
            'assigned_by'      => Auth::id(),
            'notes'            => $validated['notes'] ?? null,
            'status'           => 'active',
        ]);

        return redirect()->back()->with('success', "Member assigned to class successfully.");
    }

    /**
     * Remove member from a class slot
     */
    public function unassignMember(Request $request)
    {
        $validated = $request->validate([
            'member_id'        => 'required|exists:members,id',
            'program_class_id' => 'required|exists:program_classes,id',
        ]);

        MemberProgramClass::where('member_id', $validated['member_id'])
            ->where('program_class_id', $validated['program_class_id'])
            ->update(['status' => 'dropped']);

        return redirect()->back()->with('success', 'Member removed from class slot.');
    }

    /**
     * Get available makeup slots for an absence (API for frontend select)
     */
    public function availableMakeupSlots(ClassAbsence $absence)
    {
        $slots = $this->absenceService->availableMakeupSlots($absence);

        return response()->json(['slots' => $slots]);
    }
}
