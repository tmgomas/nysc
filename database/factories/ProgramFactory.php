<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Program>
 */
class ProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'short_code' => strtoupper(fake()->lexify('???')),
            'description' => fake()->sentence(),
            'admission_fee' => fake()->randomFloat(2, 500, 5000),
            'monthly_fee' => fake()->randomFloat(2, 500, 5000),
            'capacity' => fake()->numberBetween(10, 100),
            'is_active' => true,
            'schedule_type' => 'weekly',
            'schedule' => [],
        ];
    }
}
