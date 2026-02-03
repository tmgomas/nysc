<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sport;

class SportShortCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sportCodes = [
            'Swimming' => 'SW',
            'Cricket' => 'CR',
            'Martial Arts' => 'MA',
            'Gym/Fitness' => 'GY',
            'Yoga' => 'YO',
            'Football' => 'FB',
            'Basketball' => 'BB',
            'Volleyball' => 'VB',
            'Tennis' => 'TN',
            'Badminton' => 'BD',
            'Table Tennis' => 'TT',
            'Athletics' => 'AT',
            'Netball' => 'NB',
            'Rugby' => 'RG',
            'Hockey' => 'HK',
            'Karate' => 'KR',
            'Taekwondo' => 'TK',
            'Boxing' => 'BX',
            'Wrestling' => 'WR',
            'Judo' => 'JD',
            'Gymnastics' => 'GM',
            'Cycling' => 'CY',
            'Chess' => 'CH',
        ];

        foreach ($sportCodes as $sportName => $shortCode) {
            Sport::where('name', 'like', "%{$sportName}%")
                ->update(['short_code' => $shortCode]);
        }

        // Log sports without short codes
        $sportsWithoutCode = Sport::whereNull('short_code')->get();
        
        if ($sportsWithoutCode->isNotEmpty()) {
            $this->command->warn('The following sports do not have short codes:');
            foreach ($sportsWithoutCode as $sport) {
                $this->command->warn("  - {$sport->name} (ID: {$sport->id})");
            }
            $this->command->info('Please manually add short codes for these sports.');
        }
    }
}
