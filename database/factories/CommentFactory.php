<?php

namespace Database\Factories;

use App\Models\Photo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'body' => fake()->paragraph(1),
            'user_id' => User::factory(),
            'commentable_type' => Photo::class,
            'commentable_id' => Photo::factory(),
            'parent_id' => null,
        ];
    }

    public function reply(): static
    {
        return $this->state(fn () => [
            'parent_id' => \App\Models\Comment::factory(),
        ]);
    }
}
