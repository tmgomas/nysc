<?php

namespace Database\Factories;

use App\Enums\MemberStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Member>
 */
class MemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'member_number' => 'M-' . fake()->unique()->numberBetween(1000, 9999),
            'nic_passport' => fake()->unique()->regexify('[0-9]{9}[V|X]'),
            'date_of_birth' => fake()->date('Y-m-d', '-18 years'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'contact_number' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'emergency_contact' => fake()->name(),
            'emergency_number' => fake()->phoneNumber(),
            'photo_url' => null,
            'registration_date' => fake()->dateTimeBetween('-2 years', 'now'),
            'status' => fake()->randomElement(MemberStatus::cases()),
            'approved_by' => null, // Can be set via state
            'approved_at' => null,
        ];
    }

    /**
     * Indicate that the member is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MemberStatus::ACTIVE,
            'approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the member is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MemberStatus::PENDING,
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }
}
