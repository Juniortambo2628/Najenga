<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReceiptFactory extends Factory
{
    public function definition(): array
    {
        return [
            'filename' => fake()->uuid() . '.jpg',
            'original_name' => fake()->uuid() . '.jpg',
            'file_path' => 'receipts/' . fake()->uuid() . '.jpg',
            'file_size' => fake()->numberBetween(50000, 2000000),
            'mime_type' => 'image/jpeg',
            'ocr_data' => null,
            'ocr_confidence' => null,
            'extracted_text' => null,
            'extracted_amount' => null,
            'extracted_date' => null,
            'extracted_merchant' => null,
            'extracted_receipt_id' => null,
            'ocr_language' => null,
            'ocr_provider' => null,
            'processed_at' => null,
            'needs_verification' => false,
            'verification_status' => 'pending',
        ];
    }

    public function processed(): static
    {
        return $this->state(fn () => [
            'processed_at' => now(),
            'ocr_confidence' => fake()->randomFloat(2, 0.5, 1.0),
            'extracted_text' => fake()->paragraph(),
            'extracted_amount' => fake()->randomFloat(2, 100, 500000),
            'extracted_date' => fake()->date('Y-m-d'),
            'extracted_merchant' => fake()->company(),
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn () => [
            'needs_verification' => false,
            'verification_status' => 'verified',
        ]);
    }
}
