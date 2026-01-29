<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Member Settings
            [
                'key' => 'member_number_prefix',
                'value' => 'SC',
                'type' => 'string',
                'group' => 'member',
                'description' => 'Prefix for member numbers (e.g., SC0001, M0001)',
            ],
            [
                'key' => 'member_number_digits',
                'value' => '4',
                'type' => 'number',
                'group' => 'member',
                'description' => 'Number of digits for member number sequence',
            ],
            [
                'key' => 'member_number_start',
                'value' => '1',
                'type' => 'number',
                'group' => 'member',
                'description' => 'Starting number for member sequence',
            ],

            // Payment Settings
            [
                'key' => 'payment_reference_format',
                'value' => '{year}-{sport_code}-{number}',
                'type' => 'string',
                'group' => 'payment',
                'description' => 'Format for payment reference numbers',
            ],
            [
                'key' => 'payment_reference_digits',
                'value' => '4',
                'type' => 'number',
                'group' => 'payment',
                'description' => 'Number of digits for payment reference sequence',
            ],
            [
                'key' => 'payment_reference_year_format',
                'value' => 'yy',
                'type' => 'string',
                'group' => 'payment',
                'description' => 'Year format for reference numbers (yy=26, yyyy=2026)',
            ],

            // Registration Reference Settings
            [
                'key' => 'registration_reference_prefix',
                'value' => 'REG',
                'type' => 'string',
                'group' => 'registration',
                'description' => 'Prefix for registration reference numbers',
            ],
            [
                'key' => 'registration_reference_digits',
                'value' => '4',
                'type' => 'number',
                'group' => 'registration',
                'description' => 'Number of digits for registration reference sequence',
            ],
            [
                'key' => 'registration_reference_year_format',
                'value' => 'yy',
                'type' => 'string',
                'group' => 'registration',
                'description' => 'Year format for registration references (yy=26, yyyy=2026)',
            ],

            // Receipt Number Settings
            [
                'key' => 'receipt_number_prefix',
                'value' => 'RCP',
                'type' => 'string',
                'group' => 'receipt',
                'description' => 'Prefix for receipt numbers',
            ],
            [
                'key' => 'receipt_number_digits',
                'value' => '4',
                'type' => 'number',
                'group' => 'receipt',
                'description' => 'Number of digits for receipt number sequence',
            ],
            [
                'key' => 'receipt_number_year_format',
                'value' => 'yy',
                'type' => 'string',
                'group' => 'receipt',
                'description' => 'Year format for receipt numbers (yy=26, yyyy=2026)',
            ],
            [
                'key' => 'receipt_number_include_year',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'receipt',
                'description' => 'Include year in receipt number',
            ],
            [
                'key' => 'receipt_number_reset_yearly',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'receipt',
                'description' => 'Reset receipt numbers each year',
            ],

            // General Settings
            [
                'key' => 'club_name',
                'value' => 'NYSC',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Club name',
            ],
            [
                'key' => 'club_full_name',
                'value' => 'National Youth Sports Club',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Full club name',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
