<?php

namespace Tests\Feature;

use App\Jobs\ProcessWhatsAppMedia;
use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use App\Models\WhatsAppLog;
use App\Services\OcrService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class ProcessWhatsAppMediaTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        config([
            'services.meta.whatsapp_access_token' => 'token',
            'services.meta.whatsapp_phone_number_id' => 'PNID',
            'services.meta.admin_wa_id' => null,
        ]);

        $this->user = User::factory()->create(['whatsapp_wa_id' => '254700000001']);
        $this->project = Project::factory()->active()->create(['client_id' => $this->user->id]);
    }

    public function test_image_is_downloaded_stored_and_filed_as_photo(): void
    {
        $this->fakeGraph(mime: 'image/png');
        $this->mockOcr(['success' => true, 'text' => '']);

        $this->runJob(['media_type' => 'image', 'media_id' => 'MEDIA1', 'mime' => 'image/png', 'caption' => '']);

        $photo = Photo::sole();
        $this->assertSame($this->project->id, $photo->project_id);
        $this->assertStringStartsWith('whatsapp/', $photo->file_path);
        $this->assertStringEndsWith('.png', $photo->file_path);
        Storage::disk('public')->assertExists($photo->file_path);
        $this->assertSame('binary-bytes', Storage::disk('public')->get($photo->file_path));
        $this->assertSame(12, (int) $photo->file_size);

        // Both Graph calls carry the bearer token.
        Http::assertSent(fn (Request $r) => $r->url() === 'https://graph.facebook.com/v18.0/MEDIA1' && $r->hasHeader('Authorization', 'Bearer token'));
        Http::assertSent(fn (Request $r) => $r->url() === 'https://lookaside.example/MEDIA1' && $r->hasHeader('Authorization', 'Bearer token'));
    }

    public function test_video_is_downloaded_without_ocr(): void
    {
        $this->fakeGraph(mime: 'video/mp4');
        $ocr = Mockery::mock(OcrService::class);
        $ocr->shouldNotReceive('extractText');
        $this->app->instance(OcrService::class, $ocr);

        $this->runJob(['media_type' => 'video', 'media_id' => 'MEDIA1', 'mime' => 'video/mp4', 'caption' => '']);

        $photo = Photo::sole();
        $this->assertStringEndsWith('.mp4', $photo->file_path);
        Storage::disk('public')->assertExists($photo->file_path);
    }

    public function test_document_ocr_text_feeds_the_classifier(): void
    {
        $this->fakeGraph(mime: 'application/pdf');
        $this->mockOcr([
            'success' => true,
            'text' => 'Confirmed. Ksh 12,500.00 sent to JOHN DOE on 8/9/26 at 10:00 AM. Transaction cost Ksh 0.00. RI12345ABC',
        ]);

        $this->runJob(['media_type' => 'document', 'media_id' => 'MEDIA1', 'mime' => 'application/pdf', 'caption' => '']);

        $expense = Expense::sole();
        $this->assertSame('whatsapp', $expense->source_channel);
        $this->assertEquals(12500, (float) $expense->amount);
        $this->assertCount(1, Storage::disk('public')->allFiles('whatsapp'));
    }

    public function test_unknown_mime_falls_back_to_a_sensible_extension(): void
    {
        $this->fakeGraph(mime: 'image/webp');
        $this->mockOcr(['success' => true, 'text' => '']);

        $this->runJob(['media_type' => 'image', 'media_id' => 'MEDIA1', 'mime' => 'image/webp', 'caption' => '']);

        $this->assertStringEndsWith('.webp', Photo::sole()->file_path);
    }

    public function test_failed_media_lookup_stores_nothing(): void
    {
        Http::fake([
            'graph.facebook.com/v18.0/MEDIA1' => Http::response(['error' => ['message' => 'expired']], 404),
            'graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.OUT']]]),
        ]);
        $ocr = Mockery::mock(OcrService::class);
        $ocr->shouldNotReceive('extractText');
        $this->app->instance(OcrService::class, $ocr);

        $this->runJob(['media_type' => 'image', 'media_id' => 'MEDIA1', 'mime' => 'image/jpeg', 'caption' => '']);

        $this->assertSame([], Storage::disk('public')->allFiles());
        $this->assertDatabaseCount('photos', 0);
    }

    public function test_outbound_reply_is_logged_with_its_wamid(): void
    {
        $this->fakeGraph(mime: 'image/jpeg');
        $this->mockOcr(['success' => true, 'text' => '']);

        $this->runJob(['media_type' => 'image', 'media_id' => 'MEDIA1', 'mime' => 'image/jpeg', 'caption' => '']);

        $this->assertDatabaseHas('whatsapp_logs', [
            'direction' => 'outbound',
            'phone_number' => '254700000001',
            'status' => 'sent',
            'message_id' => 'wamid.OUT',
        ]);
    }

    public function test_rejected_outbound_reply_is_logged_as_failed(): void
    {
        Http::fake([
            'graph.facebook.com/v18.0/PNID/messages' => Http::response(['error' => ['message' => 'Recipient not in allowed list']], 400),
        ]);

        $this->runJob(['media_type' => 'text', 'text' => 'Confirmed. Ksh 5,000.00 sent to JANE on 8/9/26 at 10:00 AM. RI99999XYZ']);

        $log = WhatsAppLog::where('direction', 'outbound')->sole();
        $this->assertSame('failed', $log->status);
        $this->assertNull($log->message_id);
        $this->assertSame('Recipient not in allowed list', $log->error_message);
    }

    public function test_outbound_connection_error_does_not_fail_the_job(): void
    {
        Http::fake(fn () => throw new ConnectionException('timeout'));

        $this->runJob(['media_type' => 'text', 'text' => 'Confirmed. Ksh 5,000.00 sent to JANE on 8/9/26 at 10:00 AM. RI99999XYZ']);

        // The expense is filed once and the job completes; a throw here would
        // make the queue retry and file it again.
        $this->assertSame(1, Expense::count());
    }

    public function test_a_screenshot_with_several_payments_files_an_expense_for_each(): void
    {
        $this->fakeGraph(mime: 'image/jpeg');
        $this->mockOcr([
            'success' => true,
            'text' => "Transport Truck 13:46\nQB2C34DEFG Confirmed.\nKsh40,000.00 sent to PETER\nOTIENO 0712345678 on 29/10/26 at\n6:57 PM.\nFuel 13:49\nQD4E56FGHJ Confirmed.\nKsh5,500.00 paid to RUBIS\nENERGY - MOMBASA ROAD.\non 30/10/26 at 8:08 AM.",
            'alternatives' => [],
        ]);

        $this->runJob(['media_type' => 'image', 'media_id' => 'MEDIA1', 'mime' => 'image/jpeg', 'caption' => '']);

        $expenses = Expense::orderBy('id')->get();
        $this->assertSame(['Transport Truck', 'Fuel'], $expenses->pluck('title')->all());
        $this->assertSame([40000.0, 5500.0], $expenses->pluck('amount')->map(fn ($a) => (float) $a)->all());
        $this->assertSame(['QB2C34DEFG', 'QD4E56FGHJ'], $expenses->pluck('reference_number')->all());
        $this->assertSame(['Transport', 'Transport'], $expenses->pluck('category')->all());
        $this->assertSame([$this->project->id, $this->project->id], $expenses->pluck('project_id')->all());
        $this->assertSame(0, Photo::count());
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'PNID/messages') && str_contains((string) $r['text']['body'] ?? '', 'Created 2 expenses'));
    }

    public function test_the_same_screenshot_twice_does_not_file_its_payments_twice(): void
    {
        $text = "QB2C34DEFG Confirmed. Ksh40,000.00 sent to PETER OTIENO 0712345678 on 29/10/26 at 6:57 PM.";
        foreach ([1, 2] as $i) {
            $this->fakeGraph(mime: 'image/jpeg');
            $this->mockOcr(['success' => true, 'text' => $text]);
            $this->runJob(['media_type' => 'image', 'media_id' => 'MEDIA1', 'mime' => 'image/jpeg', 'caption' => '']);
        }

        $this->assertSame(1, Expense::count());
    }

    public function test_an_invoice_is_filed_under_documents_not_as_an_expense(): void
    {
        $this->fakeGraph(mime: 'application/pdf');
        $this->mockOcr([
            'success' => true,
            'text' => "Mwangi Building Supplies Ltd\nTax invoice\nInvoice no: INV-00123\nDate: Oct 29, 2026 · Due: Nov 12, 2026\nGrand total: KES 18,400.00\nPaid: KES 0.00",
        ]);

        $this->runJob(['media_type' => 'document', 'media_id' => 'MEDIA1', 'mime' => 'application/pdf', 'caption' => '']);

        $this->assertSame(0, Expense::count());
        $document = Document::sole();
        $this->assertSame('invoice', $document->category);
        $this->assertSame('Invoice INV-00123 — Mwangi Building Supplies Ltd', $document->title);
        $this->assertSame($this->project->id, $document->project_id);
        $this->assertNotNull($document->getFirstMedia('files'));
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'PNID/messages') && str_contains((string) ($r['text']['body'] ?? ''), 'filed under Documents'));
    }

    public function test_a_quotation_is_filed_under_documents(): void
    {
        $this->fakeGraph(mime: 'image/jpeg');
        $this->mockOcr(['success' => true, 'text' => "Otieno Contractors Ltd\nQUOTATION\nQuote No: QT-45\nValid until: 03/12/2026\nTotal KES 85,000.00"]);

        $this->runJob(['media_type' => 'image', 'media_id' => 'MEDIA1', 'mime' => 'image/jpeg', 'caption' => '']);

        $this->assertSame(0, Expense::count());
        $this->assertSame('quote', Document::sole()->category);
    }

    public function test_a_flight_ticket_is_one_transport_expense(): void
    {
        $this->fakeGraph(mime: 'application/pdf');
        $this->mockOcr(['success' => true, 'text' => "Thank you for travelling with Jambojet\nBooking Reference / PNR K7Q2ZX\nOutbound: NBO - MBA\nTotal Paid: KES 18,200\nPayment Type Visa\nPayment Date Tuesday 20 October 2026"]);

        $this->runJob(['media_type' => 'document', 'media_id' => 'MEDIA1', 'mime' => 'application/pdf', 'caption' => '']);

        $expense = Expense::sole();
        $this->assertEquals(18200, (float) $expense->amount);
        $this->assertSame('K7Q2ZX', $expense->reference_number);
        $this->assertSame('Transport', $expense->category);
        $this->assertSame('card', $expense->payment_method);
        $this->assertSame('flight_ticket', $expense->payment_source);
    }

    private function runJob(array $payload): void
    {
        (new ProcessWhatsAppMedia($payload, $this->user->id))->handle(
            app(\App\Services\MediaClassifier::class),
            app(OcrService::class),
            app(\App\Services\PaymentMatcher::class),
        );
    }

    private function fakeGraph(string $mime): void
    {
        Http::fake([
            'graph.facebook.com/v18.0/PNID/messages' => Http::response(['messages' => [['id' => 'wamid.OUT']]]),
            'graph.facebook.com/v18.0/MEDIA1' => Http::response(['url' => 'https://lookaside.example/MEDIA1', 'mime_type' => $mime]),
            'lookaside.example/*' => Http::response('binary-bytes', 200, ['Content-Type' => $mime]),
        ]);
    }

    private function mockOcr(array $result): void
    {
        $ocr = Mockery::mock(OcrService::class);
        $ocr->shouldReceive('extractText')->once()->andReturn($result);
        $this->app->instance(OcrService::class, $ocr);
    }
}
