<?php

namespace App\Actions;

use App\Models\Payment;
use App\Models\Setting;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class GenerateReceiptNumberAction
{
    /**
     * Generate payment receipt number
     * Format: {PREFIX}-{YEAR}-{NUMBER}
     * Example: RCP-26-0001 (Receipt, 2026, 1st payment)
     * 
     * Generated for each payment
     * Can be configured via settings
     * 
     * @param CarbonInterface|null $date The payment date (defaults to current date)
     * @return string The generated receipt number
     */
    public function execute(?CarbonInterface $date = null): string
    {
        $date = $date ?? now();
        
        // Get settings
        $prefix = Setting::get('receipt_number_prefix', 'RCP');
        $yearFormat = Setting::get('receipt_number_year_format', 'yy');
        $digits = Setting::get('receipt_number_digits', 4);
        $includeYear = Setting::get('receipt_number_include_year', true);

        // Format year based on setting
        $year = $yearFormat === 'yyyy' 
            ? $date->format('Y') 
            : $date->format('y');

        // Determine if we should reset yearly or continue indefinitely
        $resetYearly = Setting::get('receipt_number_reset_yearly', true);

        if ($resetYearly) {
            // Get the last payment receipt in this year
            $lastPayment = Payment::whereYear('created_at', $date->year)
                ->whereNotNull('receipt_number')
                ->where('receipt_number', 'like', "{$prefix}-{$year}-%")
                ->latest('created_at')
                ->first();
        } else {
            // Get the last payment receipt ever
            $lastPayment = Payment::whereNotNull('receipt_number')
                ->where('receipt_number', 'like', "{$prefix}-%")
                ->latest('created_at')
                ->first();
        }

        if (!$lastPayment) {
            $nextNumber = 1;
        } else {
            // Extract number from receipt (e.g., "RCP-26-0001" -> 1 or "RCP-0001" -> 1)
            $parts = explode('-', $lastPayment->receipt_number);
            $lastNumber = (int) end($parts);
            $nextNumber = $lastNumber + 1;
        }

        // Generate receipt number
        $number = str_pad($nextNumber, $digits, '0', STR_PAD_LEFT);
        
        // Format based on whether year is included
        if ($includeYear && $resetYearly) {
            return "{$prefix}-{$year}-{$number}";
        } else {
            return "{$prefix}-{$number}";
        }
    }
}
