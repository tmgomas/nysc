<?php

namespace App\Services;

use App\Models\Member;
use App\Models\MemberImportLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MemberImportService
{
    protected MemberService $memberService;

    public function __construct(MemberService $memberService)
    {
        $this->memberService = $memberService;
    }

    /**
     * Preview import data without saving
     */
    public function previewImport(UploadedFile $file): array
    {
        $data = $this->parseCsvFile($file);
        
        $preview = [
            'total_rows' => count($data),
            'valid_rows' => 0,
            'invalid_rows' => 0,
            'samples' => [],
            'errors' => [],
        ];

        // Validate all rows and count
        foreach ($data as $index => $row) {
            $validation = $this->validateRow($row, $index + 2); // +2 for header and 0-index
            
            if ($validation['valid']) {
                $preview['valid_rows']++;
            } else {
                $preview['invalid_rows']++;
                // Only add first 10 errors to the errors array
                if (count($preview['errors']) < 10) {
                    $preview['errors'][] = [
                        'row' => $index + 2,
                        'errors' => $validation['errors'],
                    ];
                }
            }
            
            // Only add first 10 rows to samples
            if (count($preview['samples']) < 10) {
                $preview['samples'][] = [
                    'row' => $index + 2,
                    'data' => $row,
                    'valid' => $validation['valid'],
                    'errors' => $validation['errors'],
                ];
            }
        }

        return $preview;
    }

    /**
     * Import members from CSV file
     */
    public function import(UploadedFile $file, array $options = []): array
    {
        $skipDuplicates = $options['skip_duplicates'] ?? true;
        $autoApprove = $options['auto_approve'] ?? false;

        $data = $this->parseCsvFile($file);
        
        $result = [
            'success_count' => 0,
            'error_count' => 0,
            'skipped_count' => 0,
            'errors' => [],
        ];

        // Create import log
        $importLog = MemberImportLog::create([
            'user_id' => auth()->id(),
            'filename' => $file->getClientOriginalName(),
            'total_rows' => count($data),
            'status' => 'processing',
        ]);

        DB::beginTransaction();
        
        try {
            foreach ($data as $index => $row) {
                $rowNumber = $index + 2; // +2 for header and 0-index
                
                try {
                    // Validate row
                    $validation = $this->validateRow($row, $rowNumber);
                    
                    if (!$validation['valid']) {
                        $result['error_count']++;
                        $result['errors'][] = [
                            'row' => $rowNumber,
                            'errors' => $validation['errors'],
                        ];
                        continue;
                    }

                    // Check for duplicates
                    if ($skipDuplicates && $this->isDuplicate($row)) {
                        $result['skipped_count']++;
                        continue;
                    }

                    // Prepare member data
                    $memberData = $this->prepareMemberData($row);
                    
                    // Register member
                    $member = $this->memberService->register($memberData);
                    
                    // Auto-approve if requested
                    if ($autoApprove) {
                        $this->memberService->approveAndCreateAccount($member);
                    }
                    
                    $result['success_count']++;
                    
                } catch (\Exception $e) {
                    $result['error_count']++;
                    $result['errors'][] = [
                        'row' => $rowNumber,
                        'errors' => [$e->getMessage()],
                    ];
                }
            }

            // Update import log
            $importLog->update([
                'success_count' => $result['success_count'],
                'error_count' => $result['error_count'],
                'skipped_count' => $result['skipped_count'],
                'status' => 'completed',
                'errors' => $result['errors'],
                'completed_at' => now(),
            ]);

            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            $importLog->update([
                'status' => 'failed',
                'errors' => [['message' => $e->getMessage()]],
            ]);
            
            throw $e;
        }

        return $result;
    }

    /**
     * Parse CSV file into array
     */
    protected function parseCsvFile(UploadedFile $file): array
    {
        $data = [];
        $handle = fopen($file->getRealPath(), 'r');
        
        // Get headers
        $headers = fgetcsv($handle);
        
        if (!$headers) {
            throw new \Exception('Invalid CSV file: No headers found');
        }

        // Read data rows
        while (($row = fgetcsv($handle)) !== false) {
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }
            
            // Combine headers with row data
            $data[] = array_combine($headers, $row);
        }
        
        fclose($handle);
        
        return $data;
    }

    /**
     * Validate a single row
     */
    protected function validateRow(array $row, int $rowNumber): array
    {
        $rules = [
            'full_name' => 'required|string|max:255',
            'calling_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'nic_passport' => 'nullable|string',
            'date_of_birth' => 'required|date_format:Y-m-d',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'required|string',
            'address' => 'required|string',
            'blood_group' => 'nullable|string',
            'emergency_contact' => 'required|string',
            'emergency_number' => 'required|string',
            'membership_type' => 'required|in:regular,student,senior',
            'fitness_level' => 'required|in:beginner,intermediate,advanced',
            'preferred_contact_method' => 'required|string',
            'sport_ids' => 'nullable|string',
        ];

        $validator = Validator::make($row, $rules);

        if ($validator->fails()) {
            return [
                'valid' => false,
                'errors' => $validator->errors()->all(),
            ];
        }

        return [
            'valid' => true,
            'errors' => [],
        ];
    }

    /**
     * Check if member already exists
     */
    protected function isDuplicate(array $row): bool
    {
        // Check by NIC/Passport
        if (!empty($row['nic_passport'])) {
            if (Member::where('nic_passport', $row['nic_passport'])->exists()) {
                return true;
            }
        }

        // Check by email
        if (!empty($row['email'])) {
            if (Member::where('email', $row['email'])->exists()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Prepare member data for registration
     */
    protected function prepareMemberData(array $row): array
    {
        // Parse sport IDs - handle empty values
        $sportIds = [];
        if (!empty($row['sport_ids'])) {
            $sportIds = array_filter(array_map('trim', explode(',', $row['sport_ids'])));
        }

        // Parse preferred training days
        $preferredTrainingDays = !empty($row['preferred_training_days']) 
            ? array_map('trim', explode(',', $row['preferred_training_days']))
            : [];

        return [
            // Personal
            'full_name' => $row['full_name'],
            'calling_name' => $row['calling_name'],
            'email' => $row['email'] ?? null,
            'nic_passport' => $row['nic_passport'] ?? null,
            'date_of_birth' => $row['date_of_birth'],
            'gender' => $row['gender'],
            'contact_number' => $row['contact_number'],
            'address' => $row['address'],

            // Medical
            'blood_group' => $row['blood_group'] ?? null,
            'medical_history' => $row['medical_history'] ?? null,
            'allergies' => $row['allergies'] ?? null,

            // Emergency & Guardian
            'emergency_contact' => $row['emergency_contact'],
            'emergency_number' => $row['emergency_number'],
            'guardian_name' => $row['guardian_name'] ?? null,
            'guardian_nic' => $row['guardian_nic'] ?? null,
            'guardian_relationship' => $row['guardian_relationship'] ?? null,

            // Background & Preferences
            'school_occupation' => $row['school_occupation'] ?? null,
            'membership_type' => $row['membership_type'],
            'fitness_level' => $row['fitness_level'],
            'jersey_size' => $row['jersey_size'] ?? null,
            'preferred_contact_method' => $row['preferred_contact_method'],
            'referral_source' => $row['referral_source'] ?? null,
            'preferred_training_days' => $preferredTrainingDays,
            'previous_club_experience' => $row['previous_club_experience'] ?? null,

            // Sports & Legal
            'sport_ids' => $sportIds,
            'terms_accepted' => true,
            'terms_accepted_at' => now(),
            'photo_consent' => false,
        ];
    }
}
