<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Program;

class ProgramShortCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programCodes = [
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

        foreach ($programCodes as $programName => $shortCode) {
            Program::where('name', 'like', "%{$programName}%")
                ->update(['short_code' => $shortCode]);
        }

        // Log programs without short codes
        $programsWithoutCode = Program::whereNull('short_code')->get();
        
        if ($programsWithoutCode->isNotEmpty()) {
            $this->command->warn('The following programs do not have short codes:');
            foreach ($programsWithoutCode as $program) {
                $this->command->warn("  - {$program->name} (ID: {$program->id})");
            }
            $this->command->info('Please manually add short codes for these programs.');
        }
    }
}
