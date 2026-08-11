<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'client_id' => User::factory(),
            'manager_id' => null,
            'status' => fake()->randomElement(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
            'start_date' => fake()->dateTimeBetween('-6 months', '+1 month'),
            'end_date' => fake()->dateTimeBetween('+1 month', '+12 months'),
            'budget' => fake()->randomFloat(2, 10000, 5000000),
            'currency' => 'KES',
            'location' => fake()->city(),
            'progress' => fake()->numberBetween(0, 100),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => 'active']);
    }

    public function completed(): static
    {
        return $this->state(fn () => ['status' => 'completed', 'progress' => 100]);
    }
}
