<?php

namespace App\Actions;

use App\Models\MemberProgram;
use App\Models\Program;
use App\Models\Setting;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class GenerateRegistrationReferenceAction
{
    /**
     * Generate sport-specific registration reference number
     * Format: {YEAR}-{SPORT_CODE}-{NUMBER}
     * Example: 26-SW-0001 (2026, Swimming, 1st member for this sport)
     * 
     * Each program enrollment gets its own reference
     * Resets each year per sport
     * 
     * @param string $programId The program ID
     * @param CarbonInterface|null $date The enrollment date (defaults to current date)
     * @return string The generated program registration reference
     */
    public function execute(string $programId, ?CarbonInterface $date = null): string
    {
        $date = $date ?? now();
        
        // Get sport
        $program = Program::findOrFail($programId);
        
        if (!$program->short_code) {
            throw new \Exception("Program '{$program->name}' does not have a short code configured.");
        }

        // Get settings
        $yearFormat = Setting::get('registration_reference_year_format', 'yy');
        $digits = Setting::get('registration_reference_digits', 4);

        // Format year based on setting
        $year = $yearFormat === 'yyyy' 
            ? $date->format('Y') 
            : $date->format('y');

        // Get the last program enrollment for this program in this year
        $lastEnrollment = MemberProgram::query()
            ->whereHas('member', function ($query) use ($date) {
                $query->whereYear('registration_date', $date->year);
            })
            ->where('program_id', $programId)
            ->whereNotNull('program_reference')
            ->where('program_reference', 'like', "{$year}-{$program->short_code}-%")
            ->latest('enrolled_at')
            ->first();

        if (!$lastEnrollment) {
            $nextNumber = 1;
        } else {
            // Extract number from reference (e.g., "26-SW-0001" -> 1)
            $parts = explode('-', $lastEnrollment->program_reference);
            $lastNumber = (int) end($parts);
            $nextNumber = $lastNumber + 1;
        }

        // Generate reference number
        $number = str_pad($nextNumber, $digits, '0', STR_PAD_LEFT);
        
        return "{$year}-{$program->short_code}-{$number}";
    }
}
