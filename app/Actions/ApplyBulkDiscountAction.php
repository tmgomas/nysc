<?php

namespace App\Actions;

use App\Models\Payment;

class ApplyBulkDiscountAction
{
    /**
     * Apply discount to bulk payments
     * 
     * @param float $originalAmount Original payment amount
     * @param int $months Number of months
     * @return array Discount details
     */
    public function execute(float $originalAmount, int $months): array
    {
        $discountPercentage = $this->calculateDiscountPercentage($months);
        $discountAmount = ($originalAmount * $discountPercentage) / 100;
        $finalAmount = $originalAmount - $discountAmount;

        return [
            'original_amount' => $originalAmount,
            'discount_percentage' => $discountPercentage,
            'discount_amount' => $discountAmount,
            'final_amount' => $finalAmount,
            'months' => $months,
            'savings' => $discountAmount,
        ];
    }

    /**
     * Calculate discount percentage based on months
     */
    protected function calculateDiscountPercentage(int $months): float
    {
        return match(true) {
            $months >= 12 => 15.0,  // 15% for 12+ months
            $months >= 6 => 10.0,   // 10% for 6-11 months
            $months >= 3 => 5.0,    // 5% for 3-5 months
            default => 0.0,         // No discount for less than 3 months
        };
    }

    /**
     * Get discount tier information
     */
    public function getDiscountTiers(): array
    {
        return [
            ['months' => 12, 'discount' => 15, 'label' => '12+ months - 15% off'],
            ['months' => 6, 'discount' => 10, 'label' => '6-11 months - 10% off'],
            ['months' => 3, 'discount' => 5, 'label' => '3-5 months - 5% off'],
            ['months' => 1, 'discount' => 0, 'label' => 'Less than 3 months - No discount'],
        ];
    }
}
