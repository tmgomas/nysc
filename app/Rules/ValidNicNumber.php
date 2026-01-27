<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidNicNumber implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Sri Lankan NIC validation
        // Old format: 9 digits + V (e.g., 123456789V)
        // New format: 12 digits (e.g., 199012345678)
        
        $value = strtoupper(trim($value));
        
        $isOldFormat = preg_match('/^[0-9]{9}[VX]$/', $value);
        $isNewFormat = preg_match('/^[0-9]{12}$/', $value);
        
        if (!$isOldFormat && !$isNewFormat) {
            $fail('The :attribute must be a valid Sri Lankan NIC number (9 digits + V or 12 digits).');
        }
        
        // Additional validation for new format
        if ($isNewFormat) {
            $year = substr($value, 0, 4);
            $currentYear = date('Y');
            
            if ($year < 1900 || $year > $currentYear) {
                $fail('The :attribute contains an invalid year.');
            }
        }
    }
}
