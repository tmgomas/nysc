<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPaymentAmount implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Check if amount is a valid number
        if (!is_numeric($value)) {
            $fail('The :attribute must be a valid number.');
            return;
        }
        
        $amount = (float) $value;
        
        // Check minimum amount
        if ($amount < 0) {
            $fail('The :attribute cannot be negative.');
            return;
        }
        
        // Check maximum amount (e.g., 1,000,000 LKR)
        if ($amount > 1000000) {
            $fail('The :attribute cannot exceed Rs. 1,000,000.');
            return;
        }
        
        // Check decimal places (max 2)
        if (floor($amount * 100) != $amount * 100) {
            $fail('The :attribute can have maximum 2 decimal places.');
        }
    }
}
