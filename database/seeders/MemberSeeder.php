<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\Sport;
use App\Models\User;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all sports
        $sports = Sport::all();

        // Admin User for 'approved_by' relationship
        $admin = User::role('admin')->first() ?? User::factory()->create()->assignRole('admin');

        $this->command->info('Creating members...');

        // Create 20 Active Members
        Member::factory()
            ->count(20)
            ->active()
            ->state(function (array $attributes) use ($admin) {
                return ['approved_by' => $admin->id];
            })
            ->create()
            ->each(function ($member) use ($sports) {
                // Assign role
                $member->user->assignRole('member');

                // Attach random sports (1 to 3)
                if ($sports->count() > 0) {
                    $randomSports = $sports->random(rand(1, min(3, $sports->count()))); // Prevent error if fewer than 3 sports
                    $member->sports()->attach($randomSports, [
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
            ->each(function ($member) use ($sports) {
                // Assign role
                $member->user->assignRole('member');

                // Pending members typically selected sports but not yet fully enrolled/approved in them potentially
                // or maybe they did select them during registration.
                if ($sports->count() > 0) {
                     $randomSports = $sports->random(rand(1, min(3, $sports->count())));
                     $member->sports()->attach($randomSports, [
                        'enrolled_at' => now(), // Just enrolled
                        'status' => 'pending',
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
                    'status' => \App\Enums\MemberStatus::SUSPENDED,
                    'approved_by' => $admin->id,
                    'approved_at' => now()->subMonths(6),
                ];
            })
            ->create()
            ->each(function ($member) use ($sports) {
                $member->user->assignRole('member');
                
                if ($sports->count() > 0) {
                    $randomSports = $sports->random(rand(1, min(3, $sports->count())));
                    $member->sports()->attach($randomSports, [
                        'enrolled_at' => now()->subYears(1),
                        'status' => 'suspended',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            });

        $this->command->info('Members seeded successfully!');
    }
}
