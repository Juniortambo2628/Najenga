<?php

namespace Tests\Feature;

use App\Jobs\ProcessWhatsAppMedia;
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
