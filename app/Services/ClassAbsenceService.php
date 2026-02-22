<?php

namespace App\Services;

use App\Models\{Member, ProgramClass, ClassAbsence, MemberProgramClass};
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ClassAbsenceService
{
    /**
     * Member reports an absence
     */
    public function reportAbsence(Member $member, string $programClassId, string $absentDate, ?string $reason = null): ClassAbsence
    {
        $programClass = ProgramClass::findOrFail($programClassId);
        $date = Carbon::parse($absentDate);

        // Check member is actually assigned to this class
        $isAssigned = MemberProgramClass::where('member_id', $member->id)
            ->where('program_class_id', $programClassId)
            ->where('status', 'active')
            ->exists();

        if (!$isAssigned) {
            throw new \Exception('You are not assigned to this class.');
        }

        // Check absence not already reported for that date
        $exists = ClassAbsence::where('member_id', $member->id)
            ->where('program_class_id', $programClassId)
            ->where('absent_date', $date->toDateString())
            ->exists();

        if ($exists) {
            throw new \Exception('Absence already reported for this class on that date.');
        }

        // Date must be in the future (or today)
        if ($date->isPast() && !$date->isToday()) {
            throw new \Exception('Cannot report absence for a past date.');
        }

        return ClassAbsence::create([
            'member_id'        => $member->id,
            'program_class_id' => $programClassId,
            'absent_date'      => $date->toDateString(),
            'reason'           => $reason,
            'status'           => 'pending',
        ]);
    }

    /**
     * Admin approves absence - sets makeup deadline to +7 days
     */
    public function approve(ClassAbsence $absence, ?string $adminNotes = null): ClassAbsence
    {
        if ($absence->status !== 'pending') {
            throw new \Exception('Only pending absences can be approved.');
        }

        $absence->update([
            'status'          => 'approved',
            'approved_by'     => Auth::id(),
            'approved_at'     => now(),
            'admin_notes'     => $adminNotes,
            'makeup_deadline' => now()->addDays(7)->toDateString(), // 7 day window
        ]);

        // Notify member
        $absence->member->notify(new \App\Notifications\AbsenceApprovedNotification($absence));

        return $absence->fresh();
    }

    /**
     * Admin rejects absence
     */
    public function reject(ClassAbsence $absence, ?string $adminNotes = null): ClassAbsence
    {
        if ($absence->status !== 'pending') {
            throw new \Exception('Only pending absences can be rejected.');
        }

        $absence->update([
            'status'      => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'admin_notes' => $adminNotes,
        ]);

        // Notify member
        $absence->member->notify(new \App\Notifications\AbsenceRejectedNotification($absence));

        return $absence->fresh();
    }

    /**
     * Member selects a makeup class
     */
    public function selectMakeup(ClassAbsence $absence, string $makeupClassId, string $makeupDate): ClassAbsence
    {
        $errors = $this->validateMakeupSelection($absence, $makeupClassId, $makeupDate);

        if (!empty($errors)) {
            throw new \Exception(implode(' | ', $errors));
        }

        $absence->update([
            'status'          => 'makeup_selected',
            'makeup_class_id' => $makeupClassId,
            'makeup_date'     => $makeupDate,
        ]);

        // Notify admin
        $adminNotification = new \App\Notifications\MakeupClassSelectedNotification($absence);
        \App\Models\User::role('admin')->each(fn($u) => $u->notify($adminNotification));

        return $absence->fresh(['programClass', 'makeupClass']);
    }

    /**
     * Validate makeup class selection against all business rules
     */
    public function validateMakeupSelection(ClassAbsence $absence, string $makeupClassId, string $makeupDate): array
    {
        $errors = [];
        $makeup = ProgramClass::find($makeupClassId);
        $date   = Carbon::parse($makeupDate);

        if (!$makeup) {
            return ['Makeup class not found.'];
        }

        // 1. Absence must be approved
        if ($absence->status !== 'approved') {
            $errors[] = 'Absence has not been approved yet.';
        }

        // 2. Within 7-day deadline
        if ($absence->isDeadlineExpired()) {
            $errors[] = "Makeup selection deadline expired ({$absence->makeup_deadline->format('M d, Y')}).";
        }

        // 3. Same program
        $originalProgram = $absence->programClass->program_id;
        if ($makeup->program_id !== $originalProgram) {
            $errors[] = 'Makeup class must be in the same program.';
        }

        // 4. Same month as absent date
        if ($date->format('Y-m') !== $absence->absent_date->format('Y-m')) {
            $errors[] = 'Makeup class must be in the same month as the absence.';
        }

        // 5. Makeup date must be after absent date
        if ($date->lte($absence->absent_date)) {
            $errors[] = 'Makeup class date must be after the absent date.';
        }

        // 6. Makeup date within deadline
        if ($absence->makeup_deadline && $date->gt($absence->makeup_deadline)) {
            $errors[] = 'Makeup date must be within the 7-day window.';
        }

        // 7. Capacity check (regular + existing makeups)
        if ($makeup->capacity) {
            $assignedCount = $makeup->assignedMembers()->count();
            $makeupCount   = ClassAbsence::where('makeup_class_id', $makeupClassId)
                ->whereIn('status', ['makeup_selected', 'completed'])
                ->count();
            if (($assignedCount + $makeupCount) >= $makeup->capacity) {
                $errors[] = 'Selected class is full.';
            }
        }

        // 8. Max 2 makeups per month
        $monthMakeups = ClassAbsence::where('member_id', $absence->member_id)
            ->whereMonth('absent_date', $absence->absent_date->month)
            ->whereYear('absent_date', $absence->absent_date->year)
            ->whereIn('status', ['makeup_selected', 'completed'])
            ->where('id', '!=', $absence->id)
            ->count();

        if ($monthMakeups >= 2) {
            $errors[] = 'Maximum 2 makeup classes per month already reached.';
        }

        // 9. Not already assigned to the makeup slot on that day
        $alreadyAssigned = MemberProgramClass::where('member_id', $absence->member_id)
            ->where('program_class_id', $makeupClassId)
            ->where('status', 'active')
            ->exists();

        if ($alreadyAssigned) {
            $errors[] = 'You are already assigned to this class slot.';
        }

        return $errors;
    }

    /**
     * Get available makeup slots for an absence
     */
    public function availableMakeupSlots(ClassAbsence $absence): \Illuminate\Database\Eloquent\Collection
    {
        $originalClass = $absence->programClass;

        return ProgramClass::where('program_id', $originalClass->program_id)
            ->where('is_active', true)
            ->where('id', '!=', $absence->program_class_id)
            // valid_to must be within same month as absence
            ->where(function ($q) use ($absence) {
                $monthStart = $absence->absent_date->copy()->startOfMonth();
                $monthEnd   = $absence->absent_date->copy()->endOfMonth();
                $q->whereNull('valid_to')->orWhere('valid_to', '>=', $monthStart);
                $q->where(function ($q2) use ($monthEnd) {
                    $q2->whereNull('valid_from')->orWhere('valid_from', '<=', $monthEnd);
                });
            })
            ->get()
            ->map(function ($slot) use ($absence) {
                // Check capacity
                $assignedCount = $slot->assignedMembers()->count();
                $makeupCount   = ClassAbsence::where('makeup_class_id', $slot->id)
                    ->whereIn('status', ['makeup_selected', 'completed'])
                    ->count();
                $available = $slot->capacity
                    ? max(0, $slot->capacity - $assignedCount - $makeupCount)
                    : 999;

                $slot->setAttribute('available_spots', $available);
                $slot->setAttribute('is_full', $available === 0);

                return $slot;
            });
    }

    /**
     * Expire absences where the makeup deadline has passed (run via scheduler)
     */
    public function expireDeadlines(): int
    {
        $expired = ClassAbsence::where('status', 'approved')
            ->where('makeup_deadline', '<', now()->toDateString())
            ->get();

        $count = 0;
        foreach ($expired as $absence) {
            $absence->update(['status' => 'expired']);
            // Notify member
            try {
                $absence->member->notify(new \App\Notifications\AbsenceMakeupExpiredNotification($absence));
            } catch (\Exception $e) {
                // Don't fail the job if notification fails
            }
            $count++;
        }

        return $count;
    }
}
