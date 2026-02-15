<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        try {
            // Super Admin
            $superAdmin = User::firstOrCreate(
                ['email' => 'superadmin@nysc.lk'],
                [
                    'name' => 'Super Admin',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $superAdmin->assignRole('super_admin');

            // Admin
            $admin = User::firstOrCreate(
                ['email' => 'admin@nysc.lk'],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $admin->assignRole('admin');

            // Staff
            $staff = User::firstOrCreate(
                ['email' => 'staff@nysc.lk'],
                [
                    'name' => 'Staff User',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $staff->assignRole('staff');

            // Coach
            $coach = User::firstOrCreate(
                ['email' => 'coach@nysc.lk'],
                [
                    'name' => 'Coach User',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $coach->assignRole('coach');

            $this->command->info('Users seeded successfully!');
            $this->command->info('');
            $this->command->info('Login Credentials:');
            $this->command->info('Super Admin: superadmin@nysc.lk / password');
            $this->command->info('Admin: admin@nysc.lk / password');
            $this->command->info('Staff: staff@nysc.lk / password');
            $this->command->info('Coach: coach@nysc.lk / password');

        } catch (\Exception $e) {
            $this->command->error('UserSeeder failed: ' . $e->getMessage());
        }
    }
}
