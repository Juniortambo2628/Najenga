<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use App\Models\Folder;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'folder_id' => null,
            'filename' => fake()->uuid() . '.pdf',
            'original_name' => fake()->sentence(2) . '.pdf',
            'file_path' => 'documents/' . fake()->uuid() . '.pdf',
            'file_size' => fake()->numberBetween(10000, 10000000),
            'mime_type' => 'application/pdf',
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(1),
            'category' => fake()->randomElement(['drawing', 'permit', 'invoice', 'ticket', 'other']),
            'document_date' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
