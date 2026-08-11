<?php

namespace Database\Factories;

use App\Models\Photo;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnnotationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'annotatable_id' => Photo::factory(),
            'annotatable_type' => Photo::class,
            'user_id' => \App\Models\User::factory(),
            'x' => fake()->randomFloat(2, 0, 1000),
            'y' => fake()->randomFloat(2, 0, 1000),
            'width' => fake()->randomFloat(2, 50, 300),
            'height' => fake()->randomFloat(2, 30, 200),
            'body' => fake()->paragraph(1),
            'resolved' => fake()->boolean(10),
        ];
    }
}
