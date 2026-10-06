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
            'x' => fake()->randomFloat(2, 0, 100),
            'y' => fake()->randomFloat(2, 0, 100),
            'width' => fake()->randomFloat(2, 5, 100),
            'height' => fake()->randomFloat(2, 5, 100),
            'body' => fake()->paragraph(1),
            'resolved' => fake()->boolean(10),
        ];
    }
}
