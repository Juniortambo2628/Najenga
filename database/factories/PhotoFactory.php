<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'filename' => fake()->uuid() . '.jpg',
            'original_name' => fake()->uuid() . '.jpg',
            'file_path' => 'photos/' . fake()->uuid() . '.jpg',
            'file_size' => fake()->numberBetween(100000, 5000000),
            'mime_type' => 'image/jpeg',
            'title' => fake()->sentence(3),
            'location' => fake()->city(),
            'description' => fake()->paragraph(1),
            'category' => fake()->randomElement(['site_progress', 'materials', 'aerial', 'documentation', 'other']),
            'photo_date' => fake()->dateTimeBetween('-3 months', 'now'),
            'is_featured' => fake()->boolean(10),
        ];
    }
}
