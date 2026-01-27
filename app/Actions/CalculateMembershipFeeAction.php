<?php

namespace App\Actions;

use App\Models\Sport;

class CalculateMembershipFeeAction
{
    /**
     * Calculate total membership fees for selected sports
     * 
     * @param array $sportIds Array of sport IDs
     * @param bool $includeAdmission Whether to include admission fees
     * @return array Fee breakdown
     */
    public function execute(array $sportIds, bool $includeAdmission = true): array
    {
        $sports = Sport::whereIn('id', $sportIds)->get();

        $admissionTotal = $includeAdmission ? $sports->sum('admission_fee') : 0;
        $monthlyTotal = $sports->sum('monthly_fee');
        $grandTotal = $admissionTotal + $monthlyTotal;

        return [
            'admission_total' => $admissionTotal,
            'monthly_total' => $monthlyTotal,
            'grand_total' => $grandTotal,
            'sports_breakdown' => $sports->map(function ($sport) use ($includeAdmission) {
                return [
                    'id' => $sport->id,
                    'name' => $sport->name,
                    'admission_fee' => $includeAdmission ? $sport->admission_fee : 0,
                    'monthly_fee' => $sport->monthly_fee,
                    'total' => ($includeAdmission ? $sport->admission_fee : 0) + $sport->monthly_fee,
                ];
            })->toArray(),
        ];
    }

    /**
     * Calculate bulk payment amount for multiple months
     */
    public function calculateBulkPayment(array $sportIds, int $months): array
    {
        $sports = Sport::whereIn('id', $sportIds)->get();
        $monthlyTotal = $sports->sum('monthly_fee');
        $bulkTotal = $monthlyTotal * $months;

        return [
            'monthly_total' => $monthlyTotal,
            'months' => $months,
            'bulk_total' => $bulkTotal,
            'per_month_breakdown' => $sports->map(function ($sport) {
                return [
                    'name' => $sport->name,
                    'monthly_fee' => $sport->monthly_fee,
                ];
            })->toArray(),
        ];
    }
}
