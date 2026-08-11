<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WhatsAppLog>
 */
class WhatsAppLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'phone_number' => fake()->e164PhoneNumber(),
            'message' => fake()->sentence(),
            'direction' => fake()->randomElement(['inbound', 'outbound']),
            'status' => fake()->randomElement(['pending', 'sent', 'delivered', 'read', 'failed']),
            'message_id' => fake()->uuid(),
            'timestamp' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
