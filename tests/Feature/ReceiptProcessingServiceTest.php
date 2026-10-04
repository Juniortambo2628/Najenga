<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\OcrService;
use App\Services\ReceiptParser;
use App\Services\ReceiptProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReceiptProcessingServiceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private const SAMPLE_TEXT = 'KES 1500 paid to Jane Doe Ref: ABC123 12/03/2026';

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Storage::fake();
    }

    private function serviceWithOcr(string $text): ReceiptProcessingService
    {
        $ocr = $this->createMock(OcrService::class);
        $ocr->method('extractText')->willReturn([
            'success' => true,
            'text' => $text,
            'confidence' => 0.9,
            'source' => 'test-fixture',
        ]);

        return new ReceiptProcessingService($ocr, new ReceiptParser());
    }

    public function test_processes_a_receipt_url_into_an_expense(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'rcpt');
        file_put_contents($source, 'not really an image');

        try {
            $expense = $this->serviceWithOcr(self::SAMPLE_TEXT)
                ->processReceiptFromUrl($source, $this->user);
        } finally {
            @unlink($source);
        }

        // Regression: this used to call ReceiptController::parseReceiptText(),
        // a method that does not exist, throwing an \Error that the service's
        // catch (\Exception) let escape.
        $this->assertNotNull($expense, 'The receipt should have become an expense.');
        $this->assertSame(1500.0, (float) $expense->amount);
        $this->assertSame('Jane Doe', $expense->recipient);
        $this->assertSame('ABC123', $expense->reference_number);
        $this->assertSame('2026-03-12', $expense->expense_date->toDateString());
        $this->assertSame('mobile_money', $expense->payment_method);
        $this->assertSame('pending', $expense->status);
        $this->assertSame($this->user->id, $expense->user_id);
    }

    public function test_stores_the_downloaded_image(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'rcpt');
        file_put_contents($source, 'image bytes');

        try {
            $this->serviceWithOcr(self::SAMPLE_TEXT)
                ->processReceiptFromUrl($source, $this->user);
        } finally {
            @unlink($source);
        }

        $stored = Storage::files('receipts');
        $this->assertCount(1, $stored, 'The downloaded image should be kept under receipts/');
    }

    public function test_returns_null_when_ocr_fails(): void
    {
        $ocr = $this->createMock(OcrService::class);
        $ocr->method('extractText')->willReturn([
            'success' => false,
            'message' => 'unreadable image',
        ]);

        $source = tempnam(sys_get_temp_dir(), 'rcpt');

        try {
            $expense = (new ReceiptProcessingService($ocr, new ReceiptParser()))
                ->processReceiptFromUrl($source, $this->user);
        } finally {
            @unlink($source);
        }

        $this->assertNull($expense);
        $this->assertDatabaseCount('expenses', 0);
    }
}
