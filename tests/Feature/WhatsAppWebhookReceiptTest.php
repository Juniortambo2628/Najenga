<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\User;
use App\Models\WhatsAppLog;
use App\Services\OcrService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WhatsAppWebhookReceiptTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // 'local' holds the temp receipt, 'public' is where Spatie stores media.
        Storage::fake();
        Storage::fake('public');
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

    private function payload(): array
    {
        return [
            'object' => 'whatsapp_business_account',
            'entry' => [[
                'id' => 'WABA_ID',
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messaging_product' => 'whatsapp',
                        'metadata' => ['phone_number_id' => 'PN_ID'],
                        'contacts' => [[
                            'profile' => ['name' => 'Test User'],
                            'wa_id' => '254700000000',
                        ]],
                        'messages' => [[
                            'from' => '254700000000',
                            'id' => 'wamid.TEST',
                            'timestamp' => '1700000000',
                            'type' => 'image',
                            'image' => [
                                'id' => 'MEDIA123',
                                'mime_type' => 'image/jpeg',
                                'sha256' => 'deadbeef',
                                'caption' => 'receipt',
                            ],
                        ]],
                    ],
                ]],
            ]],
        ];
    }

    private function textPayload(): array
    {
        $payload = $this->payload();
        $payload['entry'][0]['changes'][0]['value']['messages'][0] = [
            'from' => '254700000000',
            'id' => 'wamid.TEST',
            'timestamp' => '1700000000',
            'type' => 'text',
            'text' => ['body' => 'receipt attached'],
        ];

        return $payload;
    }

    public function test_receipt_image_is_fetched_exactly_once(): void
    {
        User::factory()->create(['whatsapp_wa_id' => '254700000000', 'phone' => '254700000000']);

        $ocr = $this->createMock(OcrService::class);
        $ocr->method('extractText')->willReturn([
            'success'    => true,
            'text'       => 'KES 1500 paid to Jane Doe Ref: ABC123 12/03/2026',
            'confidence' => 0.9,
            'source'     => 'test-fixture',
        ]);
        $this->app->instance(OcrService::class, $ocr);

        Http::fake([
            'graph.facebook.com/*' => Http::response(['url' => 'https://cdn.example/receipt.jpg']),
            'cdn.example/*' => Http::response($this->jpegBytes(), 200),
        ]);

        $this->postJson('/api/whatsapp/webhook', $this->payload())
            ->assertOk();

        $downloads = Http::recorded()
            ->filter(fn ($pair) => $pair[0]->url() === 'https://cdn.example/receipt.jpg')
            ->count();

        $this->assertSame(1, $downloads, 'the receipt image must be downloaded exactly once');

        $this->assertDatabaseCount('expenses', 1);
        $this->assertDatabaseHas('whatsapp_logs', ['direction' => 'inbound']);
    }

    public function test_media_endpoint_is_consulted_before_the_image(): void
    {
        User::factory()->create(['whatsapp_wa_id' => '254700000000', 'phone' => '254700000000']);

        $ocr = $this->createMock(OcrService::class);
        $ocr->method('extractText')->willReturn([
            'success' => true,
            'text' => 'KES 1500 paid to Jane Doe Ref: ABC123 12/03/2026',
            'confidence' => 0.9,
            'source' => 'test-fixture',
        ]);
        $this->app->instance(OcrService::class, $ocr);

        Http::fake([
            'graph.facebook.com/*' => Http::response(['url' => 'https://cdn.example/receipt.jpg']),
            'cdn.example/*' => Http::response($this->jpegBytes(), 200),
        ]);

        $this->postJson('/api/whatsapp/webhook', $this->payload())->assertOk();

        Http::assertSent(fn ($request) => $request->url() === 'https://graph.facebook.com/v18.0/MEDIA123');
        Http::assertSent(fn ($request) => $request->url() === 'https://cdn.example/receipt.jpg');
    }

    public function test_an_unmatched_number_is_ignored_without_downloading(): void
    {
        Http::fake();

        $this->postJson('/api/whatsapp/webhook', $this->payload())
            ->assertOk();

        Http::assertNothingSent();

        $this->assertDatabaseCount('expenses', 0);
    }

    public function test_a_user_without_a_phone_number_does_not_crash_the_webhook(): void
    {
        User::factory()->create(['whatsapp_wa_id' => '254700000000', 'phone' => null]);

        config([
            'services.meta.whatsapp_phone_number_id' => 'PN_ID',
            'services.meta.whatsapp_access_token' => 'TOKEN',
        ]);

        $ocr = $this->createMock(OcrService::class);
        $ocr->method('extractText')->willReturn([
            'success'    => true,
            'text'       => 'KES 1500 paid to Jane Doe Ref: ABC123 12/03/2026',
            'confidence' => 0.9,
            'source'     => 'test-fixture',
        ]);
        $this->app->instance(OcrService::class, $ocr);

        Http::fake([
            'graph.facebook.com/*' => Http::response(['url' => 'https://cdn.example/receipt.jpg']),
            'cdn.example/*' => Http::response($this->jpegBytes(), 200),
        ]);

        $this->postJson('/api/whatsapp/webhook', $this->payload())
            ->assertOk();

        $this->assertDatabaseCount('expenses', 1);
    }

    public function test_processed_receipt_files_the_inbound_log_against_the_expense(): void
    {
        User::factory()->create(['whatsapp_wa_id' => '254700000000', 'phone' => '254700000000']);

        $ocr = $this->createMock(OcrService::class);
        $ocr->method('extractText')->willReturn([
            'success'    => true,
            'text'       => 'KES 1500 paid to Jane Doe Ref: ABC123 12/03/2026',
            'confidence' => 0.9,
            'source'     => 'test-fixture',
        ]);
        $this->app->instance(OcrService::class, $ocr);

        Http::fake([
            'graph.facebook.com/*' => Http::response(['url' => 'https://cdn.example/receipt.jpg']),
            'cdn.example/*' => Http::response($this->jpegBytes(), 200),
        ]);

        $this->postJson('/api/whatsapp/webhook', $this->payload())->assertOk();

        $expense = Expense::query()->firstOrFail();
        $log = WhatsAppLog::query()->where('direction', 'inbound')->firstOrFail();

        $this->assertSame($expense->getMorphClass(), $log->filed_type);
        $this->assertSame($expense->id, $log->filed_id);
        $this->assertTrue($log->filed->is($expense));
    }

    public function test_failed_processing_leaves_the_log_unfiled(): void
    {
        User::factory()->create(['whatsapp_wa_id' => '254700000000', 'phone' => '254700000000']);

        $ocr = $this->createMock(OcrService::class);
        $ocr->method('extractText')->willReturn([
            'success' => false,
            'message' => 'unreadable',
        ]);
        $this->app->instance(OcrService::class, $ocr);

        Http::fake([
            'graph.facebook.com/*' => Http::response(['url' => 'https://cdn.example/receipt.jpg']),
            'cdn.example/*' => Http::response($this->jpegBytes(), 200),
        ]);

        $this->postJson('/api/whatsapp/webhook', $this->payload())->assertOk();

        $log = WhatsAppLog::query()->where('direction', 'inbound')->firstOrFail();

        $this->assertNull($log->filed_type);
        $this->assertNull($log->filed_id);
        $this->assertDatabaseCount('expenses', 0);
    }

    public function test_handled_events_are_marked_processed(): void
    {
        User::factory()->create(['whatsapp_wa_id' => '254700000000', 'phone' => '254700000000']);

        $this->postJson('/api/whatsapp/webhook', $this->textPayload())->assertOk();

        $event = \App\Models\WhatsAppWebhookEvent::query()->firstOrFail();

        $this->assertTrue($event->processed);
        $this->assertNull($event->error_message);
        $this->assertDatabaseCount('whatsapp_logs', 1);
    }
}
