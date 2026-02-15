<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MemberImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberImportController extends Controller
{
    public function __construct(
        protected MemberImportService $importService
    ) {}

    /**
     * Show the import form
     */
    public function create()
    {
        $programs = \App\Models\Program::where('is_active', true)
            ->select('id', 'name', 'admission_fee', 'monthly_fee')
            ->get();

        return Inertia::render('Admin/Members/Import', [
            'programs' => $programs,
        ]);
    }

    /**
     * Download CSV template
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="member_import_template.csv"',
        ];

        $columns = [
            'full_name',
            'calling_name',
            'email',
            'nic_passport',
            'date_of_birth',
            'gender',
            'contact_number',
            'address',
            'blood_group',
            'medical_history',
            'allergies',
            'emergency_contact',
            'emergency_number',
            'guardian_name',
            'guardian_nic',
            'guardian_relationship',
            'school_occupation',
            'membership_type',
            'fitness_level',
            'jersey_size',
            'preferred_contact_method',
            'referral_source',
            'preferred_training_days',
            'previous_club_experience',
            'program_ids',
        ];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            
            // Write header row
            fputcsv($file, $columns);
            
            // Write example row
            fputcsv($file, [
                'John Doe',                          // full_name
                'John',                              // calling_name
                'john.doe@example.com',              // email
                '123456789V',                        // nic_passport
                '2000-01-15',                        // date_of_birth (YYYY-MM-DD)
                'male',                              // gender (male/female/other)
                '0771234567',                        // contact_number
                '123, Main Street, Colombo',         // address
                'O+',                                // blood_group
                'None',                              // medical_history
                'None',                              // allergies
                'Jane Doe',                          // emergency_contact
                '0779876543',                        // emergency_number
                'Jane Doe',                          // guardian_name
                '987654321V',                        // guardian_nic
                'Mother',                            // guardian_relationship
                'Royal College',                     // school_occupation
                'student',                           // membership_type (regular/student/senior)
                'intermediate',                      // fitness_level (beginner/intermediate/advanced)
                'M',                                 // jersey_size
                'phone',                             // preferred_contact_method
                'Friend',                            // referral_source
                'Monday,Wednesday,Friday',           // preferred_training_days (comma-separated)
                'None',                              // previous_club_experience
                '1,2',                               // program_ids (comma-separated program IDs)
            ]);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Preview the import data
     */
    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        try {
            $preview = $this->importService->previewImport($request->file('file'));
            
            return response()->json([
                'success' => true,
                'data' => $preview,
            ]);
        } catch (\Exception $e) {
            \Log::error('Import preview failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Process the bulk import
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
            'skip_duplicates' => 'boolean',
            'auto_approve' => 'boolean',
        ]);

        try {
            $result = $this->importService->import(
                $request->file('file'),
                [
                    'skip_duplicates' => $request->boolean('skip_duplicates', true),
                    'auto_approve' => $request->boolean('auto_approve', false),
                ]
            );

            return redirect()->route('admin.members.index')
                ->with('success', sprintf(
                    'Import completed! %d members imported successfully. %d failed.',
                    $result['success_count'],
                    $result['error_count']
                ));
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Show import history/logs
     */
    public function history()
    {
        $imports = \App\Models\MemberImportLog::with('user')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Members/ImportHistory', [
            'imports' => $imports,
        ]);
    }
}
