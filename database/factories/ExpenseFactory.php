<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(1),
            'amount' => fake()->randomFloat(2, 100, 500000),
            'currency' => 'KES',
            'category' => fake()->randomElement(['materials', 'labor', 'transport', 'equipment', 'utilities', 'office', 'travel', 'other']),
            'payment_method' => fake()->randomElement(['cash', 'bank_transfer', 'mobile_money', 'card', 'check']),
            'expense_date' => fake()->dateTimeBetween('-3 months', 'now'),
            'time' => fake()->time('H:i'),
            'recipient' => fake()->company(),
            'reference_number' => strtoupper(fake()->bothify('??######')),
            'purpose' => fake()->sentence(5),
            'status' => fake()->randomElement(['draft', 'pending', 'approved', 'rejected', 'paid']),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft']);
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => 'approved']);
    }
}
