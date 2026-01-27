<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SportSeeder extends Seeder
{
    public function run(): void
    {
        $sports = [
            [
                'name' => 'Cricket',
                'description' => 'Outdoor cricket training and matches',
                'admission_fee' => 500,
                'monthly_fee' => 2500,
                'capacity' => 30,
                'location' => 'Ground A',
                'is_active' => true,
            ],
            [
                'name' => 'Football',
                'description' => 'Football training and league matches',
                'admission_fee' => 500,
                'monthly_fee' => 2500,
                'capacity' => 40,
                'location' => 'Ground B',
                'is_active' => true,
            ],
            [
                'name' => 'Basketball',
                'description' => 'Indoor basketball training',
                'admission_fee' => 300,
                'monthly_fee' => 2000,
                'capacity' => 20,
                'location' => 'Court 1',
                'is_active' => true,
            ],
            [
                'name' => 'Volleyball',
                'description' => 'Volleyball training and tournaments',
                'admission_fee' => 300,
                'monthly_fee' => 1800,
                'capacity' => 25,
                'location' => 'Court 2',
                'is_active' => true,
            ],
            [
                'name' => 'Badminton',
                'description' => 'Badminton training and coaching',
                'admission_fee' => 300,
                'monthly_fee' => 1800,
                'capacity' => 25,
                'location' => 'Indoor Hall',
                'is_active' => true,
            ],
            [
                'name' => 'Table Tennis',
                'description' => 'Table tennis practice and competitions',
                'admission_fee' => 200,
                'monthly_fee' => 1500,
                'capacity' => 20,
                'location' => 'Indoor Hall',
                'is_active' => true,
            ],
            [
                'name' => 'Swimming',
                'description' => 'Swimming lessons and training',
                'admission_fee' => 1000,
                'monthly_fee' => 3500,
                'capacity' => 25,
                'location' => 'Swimming Pool',
                'is_active' => true,
            ],
            [
                'name' => 'Athletics',
                'description' => 'Track and field training',
                'admission_fee' => 400,
                'monthly_fee' => 2000,
                'capacity' => 35,
                'location' => 'Athletic Track',
                'is_active' => true,
            ],
            [
                'name' => 'Gym/Fitness',
                'description' => 'Gym equipment and fitness training',
                'admission_fee' => 1500,
                'monthly_fee' => 4000,
                'capacity' => 50,
                'location' => 'Fitness Center',
                'is_active' => true,
            ],
            [
                'name' => 'Yoga',
                'description' => 'Yoga and meditation sessions',
                'admission_fee' => 200,
                'monthly_fee' => 1500,
                'capacity' => 30,
                'location' => 'Yoga Studio',
                'is_active' => true,
            ],
            [
                'name' => 'Martial Arts',
                'description' => 'Karate, Taekwondo, and self-defense',
                'admission_fee' => 500,
                'monthly_fee' => 2200,
                'capacity' => 25,
                'location' => 'Martial Arts Dojo',
                'is_active' => true,
            ],
        ];

        foreach ($sports as $sport) {
            DB::table('sports')->insert(array_merge([
                'id' => Str::uuid()->toString(),
            ], $sport, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('Sports seeded successfully!');
    }
}
