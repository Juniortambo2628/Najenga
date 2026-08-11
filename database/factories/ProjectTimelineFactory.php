<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectTimelineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(1),
            'start_date' => fake()->dateTimeBetween('-3 months', '+1 month'),
            'end_date' => fake()->dateTimeBetween('+1 month', '+6 months'),
            'status' => fake()->randomElement(['pending', 'in_progress', 'completed', 'delayed']),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'critical']),
        ];
    }
}
