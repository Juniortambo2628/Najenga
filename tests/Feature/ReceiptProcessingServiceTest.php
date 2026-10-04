<?php

namespace Tests\Feature;

use App\Models\Expense;
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
        // 'local' holds the source file, 'public' is where Spatie stores media.
        Storage::fake();
        Storage::fake('public');
    }

    private function serviceWithOcr(?string $text, array $extra = []): ReceiptProcessingService
    {
        $ocr = $this->createMock(OcrService::class);
        $ocr->method('extractText')->willReturn($text === null
            ? ['success' => false, 'message' => 'unreadable image']
            : ['success' => true, 'text' => $text, 'confidence' => 0.9, 'source' => 'test-fixture'] + $extra);

        return new ReceiptProcessingService($ocr, new ReceiptParser());
    }

    private function jpegBytes(): string
    {
        $image = imagecreatetruecolor(40, 40);
        ob_start();
        imagejpeg($image);
        $bytes = ob_get_clean();
        imagedestroy($image);

        return $bytes;
    }

    private function putReceipt(string $path): void
    {
        Storage::disk('local')->put($path, $this->jpegBytes());
    }

    private function ocrPayload(): array
    {
        return [
            'text' => self::SAMPLE_TEXT,
            'confidence' => 0.95,
            'provider' => 'tesseract',
            'data' => [
                'total' => 1500.0,
                'merchant' => 'Jane Doe',
                'date' => '2026-03-12',
                'reference_number' => 'ABC123',
            ],
        ];
    }

    public function test_processes_a_receipt_url_into_an_expense(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'rcpt');
        file_put_contents($source, $this->jpegBytes());

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
        file_put_contents($source, $this->jpegBytes());

        try {
            $expense = $this->serviceWithOcr(self::SAMPLE_TEXT)
                ->processReceiptFromUrl($source, $this->user);
        } finally {
            @unlink($source);
        }

        // The file is moved onto the expense's media collection rather than
        // being left orphaned in storage/receipts/.
        $this->assertNotNull($expense->fresh()->getFirstMedia('receipt'));
        $this->assertSame([], Storage::disk('local')->files('receipts'));
    }

    public function test_returns_null_when_ocr_fails(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'rcpt');

        try {
            $expense = $this->serviceWithOcr(null)
                ->processReceiptFromUrl($source, $this->user);
        } finally {
            @unlink($source);
        }

        $this->assertNull($expense);
        $this->assertDatabaseCount('expenses', 0);
    }

    public function test_attaching_a_receipt_mirrors_it_into_the_receipts_table(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);
        $this->putReceipt('temp_receipts/r1.jpg');

        $receipt = (new ReceiptProcessingService($this->createMock(OcrService::class), new ReceiptParser()))
            ->attachReceiptMedia($expense, 'temp_receipts/r1.jpg', 'ABC123', 'Jane Doe', 'tesseract', $this->ocrPayload());

        $this->assertNotNull($receipt);
        $this->assertSame($expense->id, $receipt->expense_id);
        $this->assertSame('ABC123_Jane_Doe.jpg', $receipt->filename);
        $this->assertSame('image/jpeg', $receipt->mime_type);
        $this->assertSame(1500.0, (float) $receipt->extracted_amount);
        $this->assertSame('Jane Doe', $receipt->extracted_merchant);
        $this->assertSame('ABC123', $receipt->extracted_receipt_id);
        $this->assertSame(0.95, (float) $receipt->ocr_confidence);
        $this->assertSame('tesseract', $receipt->ocr_provider);
        $this->assertSame('pending', $receipt->verification_status);
        $this->assertNotNull($receipt->processed_at);
        $this->assertNotNull($receipt->file_path);

        $media = $expense->fresh()->getFirstMedia('receipt');
        $this->assertNotNull($media, 'The image should have been moved onto the expense.');
        $this->assertSame($media->getPathRelativeToRoot(), $receipt->file_path);
        Storage::disk('local')->assertMissing('temp_receipts/r1.jpg');
    }

    public function test_the_receipt_path_parameter_is_no_longer_ignored(): void
    {
        $this->putReceipt('receipts/chat-1.jpg');
        $ocr = $this->serviceWithOcr(self::SAMPLE_TEXT);

        $expense = $ocr->createExpenseFromData(
            $this->user,
            ['recipient' => 'Jane Doe', 'reference_number' => 'ABC123'],
            'receipts/chat-1.jpg',
            $this->ocrPayload(),
        );

        $this->assertNotNull($expense->getFirstMedia('receipt'), 'createExpenseFromData dropped the file.');
        $this->assertDatabaseHas('receipts', ['expense_id' => $expense->id]);
        Storage::disk('local')->assertMissing('receipts/chat-1.jpg');
    }

    public function test_reattaching_updates_the_single_receipt_row(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);
        $service = new ReceiptProcessingService($this->createMock(OcrService::class), new ReceiptParser());

        $this->putReceipt('temp_receipts/first.jpg');
        $service->attachReceiptMedia($expense, 'temp_receipts/first.jpg', 'AAA111', 'A');

        $this->putReceipt('temp_receipts/second.jpg');
        $service->attachReceiptMedia($expense, 'temp_receipts/second.jpg', 'BBB222', 'B');

        // Expense::receipt() is a hasOne, so a second upload must not orphan
        // the first row.
        $this->assertSame(1, $expense->receipt()->count());
        $this->assertDatabaseHas('receipts', ['expense_id' => $expense->id, 'filename' => 'BBB222_B.jpg']);
    }

    public function test_attach_is_a_no_op_when_the_file_is_missing(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);

        $receipt = (new ReceiptProcessingService($this->createMock(OcrService::class), new ReceiptParser()))
            ->attachReceiptMedia($expense, 'temp_receipts/absent.jpg');

        $this->assertNull($receipt);
        $this->assertDatabaseCount('receipts', 0);
        $this->assertNull($expense->fresh()->getFirstMedia('receipt'));
    }
}
