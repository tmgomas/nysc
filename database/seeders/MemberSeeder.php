<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\Program;
use App\Models\User;
use App\Enums\MemberStatus;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        try {
            // Get all programs
            $programs = Program::all();
            
            if ($programs->isEmpty()) {
                $this->command->warn('No programs found. Skipping member program enrollment.');
            }

            // Admin User for 'approved_by' relationship
            $admin = User::role('admin')->first();
            
            if (!$admin) {
                $this->command->info('Creating admin user for member approval...');
                $admin = User::factory()->create();
                $admin->assignRole('admin');
            }

            $this->command->info('Creating members...');

            // Create 20 Active Members
            Member::factory()
                ->count(20)
                ->active()
                ->state(function (array $attributes) use ($admin) {
                    return ['approved_by' => $admin->id];
                })
                ->create()
                ->each(function ($member) use ($programs) {
                    // Assign role
                    if ($member->user) {
                        $member->user->assignRole('member');
                    }

                    // Attach random programs (1 to 3)
                    if ($programs->count() > 0) {
                        $randomPrograms = $programs->random(rand(1, min(3, $programs->count())));
                        $member->programs()->attach($randomPrograms, [
                            'enrolled_at' => now()->subDays(rand(1, 365)),
                            'status' => 'active',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                });

            // Create 10 Pending Members
            Member::factory()
                ->count(10)
                ->pending()
                ->create()
                ->each(function ($member) use ($programs) {
                    // Assign role
                    if ($member->user) {
                        $member->user->assignRole('member');
                    }

                    if ($programs->count() > 0) {
                        $randomPrograms = $programs->random(rand(1, min(3, $programs->count())));
                        $member->programs()->attach($randomPrograms, [
                            'enrolled_at' => now(),
                            'status' => 'inactive', // Use inactive for pending members
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                });

            // Create 5 Suspended Members
            Member::factory()
                ->count(5)
                ->state(function (array $attributes) use ($admin) {
                    return [
                        'status' => 'suspended', 
                        'approved_by' => $admin->id,
                        'approved_at' => now()->subMonths(6),
                    ];
                })
                ->create()
                ->each(function ($member) use ($programs) {
                    if ($member->user) {
                        $member->user->assignRole('member');
                    }
                    
                    if ($programs->count() > 0) {
                        $randomPrograms = $programs->random(rand(1, min(3, $programs->count())));
                        $member->programs()->attach($randomPrograms, [
                            'enrolled_at' => now()->subYears(1),
                            'status' => 'inactive', // Use inactive for suspended members
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                });

            $this->command->info('Members seeded successfully!');
        } catch (\Exception $e) {
            file_put_contents('simple_error.txt', $e->getMessage());
            $this->command->error('MemberSeeder failed. Check simple_error.txt');
        }
    }
}
