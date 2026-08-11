<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WhatsAppWebhookEvent>
 */
class WhatsAppWebhookEventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'payload' => fake()->jsonObject(),
            'signature' => fake()->sha256(),
            'timestamp' => fake()->dateTimeBetween('-30 days', 'now'),
            'processed' => fake()->boolean(),
            'error_message' => null,
        ];
    }
}
