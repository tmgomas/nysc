<?php

namespace App\Actions;

use App\Models\Payment;
use App\Models\Sport;
use App\Models\Setting;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class GeneratePaymentReferenceAction
{
    /**
     * Generate sport-specific payment reference number
     * Format: {YEAR}-{SPORT_CODE}-{NUMBER}
     * Example: 26-SW-0001 (2026, Swimming, 1st payment)
     * 
     * @param string $sportId The sport ID
     * @param CarbonInterface|null $date The payment date (defaults to current date)
     * @return string The generated reference number
     */
    public function execute(string $sportId, ?CarbonInterface $date = null): string
    {
        $date = $date ?? now();
        
        // Get sport
        $sport = Sport::findOrFail($sportId);
        
        if (!$sport->short_code) {
            throw new \Exception("Sport '{$sport->name}' does not have a short code configured.");
        }

        // Get settings
        $yearFormat = Setting::get('payment_reference_year_format', 'yy');
        $digits = Setting::get('payment_reference_digits', 4);

        // Format year based on setting
        $year = $yearFormat === 'yyyy' 
            ? $date->format('Y') 
            : $date->format('y');

        // Get the last payment for this sport in this year
        $lastPayment = Payment::where('sport_id', $sportId)
            ->whereYear('created_at', $date->year)
            ->where('reference_number', 'like', "{$year}-{$sport->short_code}-%")
            ->latest('created_at')
            ->first();

        if (!$lastPayment) {
            $nextNumber = 1;
        } else {
            // Extract number from reference (e.g., "26-SW-0001" -> 1)
            $parts = explode('-', $lastPayment->reference_number);
            $lastNumber = (int) end($parts);
            $nextNumber = $lastNumber + 1;
        }

        // Generate reference number
        $number = str_pad($nextNumber, $digits, '0', STR_PAD_LEFT);
        
        return "{$year}-{$sport->short_code}-{$number}";
    }

    /**
     * Generate reference for multi-sport payment
     * Format: {YEAR}-ALL-{NUMBER}
     * Example: 26-ALL-0001
     */
    public function executeForMultipleSports(?CarbonInterface $date = null): string
    {
        $date = $date ?? now();
        
        // Get settings
        $yearFormat = Setting::get('payment_reference_year_format', 'yy');
        $digits = Setting::get('payment_reference_digits', 4);

        // Format year
        $year = $yearFormat === 'yyyy' 
            ? $date->format('Y') 
            : $date->format('y');

        // Get the last multi-sport payment in this year
        $lastPayment = Payment::whereNull('sport_id')
            ->whereYear('created_at', $date->year)
            ->where('reference_number', 'like', "{$year}-ALL-%")
            ->latest('created_at')
            ->first();

        if (!$lastPayment) {
            $nextNumber = 1;
        } else {
            // Extract number from reference
            $parts = explode('-', $lastPayment->reference_number);
            $lastNumber = (int) end($parts);
            $nextNumber = $lastNumber + 1;
        }

        $number = str_pad($nextNumber, $digits, '0', STR_PAD_LEFT);
        
        return "{$year}-ALL-{$number}";
    }
}
