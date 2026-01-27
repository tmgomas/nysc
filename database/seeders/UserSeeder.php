<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@nysc.lk',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('super_admin');

        // Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@nysc.lk',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Staff
        $staff = User::create([
            'name' => 'Staff User',
            'email' => 'staff@nysc.lk',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $staff->assignRole('staff');

        // Coach
        $coach = User::create([
            'name' => 'Coach User',
            'email' => 'coach@nysc.lk',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $coach->assignRole('coach');

        $this->command->info('Users seeded successfully!');
        $this->command->info('');
        $this->command->info('Login Credentials:');
        $this->command->info('Super Admin: superadmin@nysc.lk / password');
        $this->command->info('Admin: admin@nysc.lk / password');
        $this->command->info('Staff: staff@nysc.lk / password');
        $this->command->info('Coach: coach@nysc.lk / password');
    }
}
