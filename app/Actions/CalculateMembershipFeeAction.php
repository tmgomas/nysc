<?php

namespace App\Actions;

use App\Models\Program;

class CalculateMembershipFeeAction
{
    /**
     * Calculate total membership fees for selected programs
     * 
     * @param array $programIds Array of program IDs
     * @param bool $includeAdmission Whether to include admission fees
     * @return array Fee breakdown
     */
    public function execute(array $programIds, bool $includeAdmission = true): array
    {
        $programs = Program::whereIn('id', $programIds)->get();

        $admissionTotal = $includeAdmission ? $programs->sum('admission_fee') : 0;
        $monthlyTotal = $programs->sum('monthly_fee');
        $grandTotal = $admissionTotal + $monthlyTotal;

        return [
            'admission_total' => $admissionTotal,
            'monthly_total' => $monthlyTotal,
            'grand_total' => $grandTotal,
            'sports_breakdown' => $programs->map(function ($program) use ($includeAdmission) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'admission_fee' => $includeAdmission ? $program->admission_fee : 0,
                    'monthly_fee' => $program->monthly_fee,
                    'total' => ($includeAdmission ? $program->admission_fee : 0) + $program->monthly_fee,
                ];
            })->toArray(),
        ];
    }

    /**
     * Calculate bulk payment amount for multiple months
     */
    public function calculateBulkPayment(array $programIds, int $months): array
    {
        $programs = Program::whereIn('id', $programIds)->get();
        $monthlyTotal = $programs->sum('monthly_fee');
        $bulkTotal = $monthlyTotal * $months;

        return [
            'monthly_total' => $monthlyTotal,
            'months' => $months,
            'bulk_total' => $bulkTotal,
            'per_month_breakdown' => $programs->map(function ($program) {
                return [
                    'name' => $program->name,
                    'monthly_fee' => $program->monthly_fee,
                ];
            })->toArray(),
        ];
    }
}
