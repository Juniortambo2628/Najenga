<?php

namespace Tests\Feature;

use App\Jobs\ProcessWhatsAppMedia;
use App\Models\User;
use App\Models\WhatsAppLog;
use App\Models\WhatsAppWebhookEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'test-app-secret';

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        config(['services.meta.whatsapp_app_secret' => self::SECRET]);
        $this->user = User::factory()->create(['whatsapp_wa_id' => '254700000001']);
    }

    // ── Signature verification ──

    public function test_valid_signature_is_accepted_and_message_queued(): void
    {
        $this->postWebhook($this->messagePayload('wamid.A'))->assertOk();

        $this->assertDatabaseHas('whatsapp_logs', [
            'user_id' => $this->user->id,
            'message_id' => 'wamid.A',
            'direction' => 'inbound',
            'status' => 'received',
            'message' => 'Hello',
        ]);
        Queue::assertPushed(ProcessWhatsAppMedia::class, fn ($job) => $job->userId === $this->user->id
            && $job->payload === ['media_type' => 'text', 'wamid' => 'wamid.A', 'text' => 'Hello']);
        $this->assertTrue((bool) WhatsAppWebhookEvent::first()->processed);
    }

    public function test_missing_signature_is_rejected_without_storing_anything(): void
    {
        $this->postWebhook($this->messagePayload('wamid.A'), signature: false)
            ->assertStatus(401);

        $this->assertDatabaseCount('whatsapp_webhook_events', 0);
        $this->assertDatabaseCount('whatsapp_logs', 0);
        Queue::assertNothingPushed();
    }

    public function test_signature_from_wrong_secret_is_rejected(): void
    {
        $body = json_encode($this->messagePayload('wamid.A'));

        $this->postRaw($body, 'sha256=' . hash_hmac('sha256', $body, 'wrong-secret'))
            ->assertStatus(401);

        Queue::assertNothingPushed();
    }

    public function test_signature_over_a_different_body_is_rejected(): void
    {
        $signed = json_encode($this->messagePayload('wamid.A'));
        $sent = json_encode($this->messagePayload('wamid.B'));

        $this->postRaw($sent, 'sha256=' . hash_hmac('sha256', $signed, self::SECRET))
            ->assertStatus(401);

        Queue::assertNothingPushed();
    }

    public function test_unsigned_requests_are_rejected_in_production_when_secret_is_missing(): void
    {
        config(['services.meta.whatsapp_app_secret' => null]);
        $this->app['env'] = 'production';

        $this->postWebhook($this->messagePayload('wamid.A'), signature: false)
            ->assertStatus(401);

        Queue::assertNothingPushed();
    }

    public function test_unsigned_requests_are_allowed_outside_production_when_secret_is_missing(): void
    {
        config(['services.meta.whatsapp_app_secret' => null]);

        $this->postWebhook($this->messagePayload('wamid.A'), signature: false)
            ->assertOk();

        Queue::assertPushed(ProcessWhatsAppMedia::class, 1);
    }

    // ── Idempotency ──

    public function test_redelivered_message_is_processed_once(): void
    {
        $payload = $this->messagePayload('wamid.DUP');

        $this->postWebhook($payload)->assertOk();
        $this->postWebhook($payload)->assertOk();

        $this->assertSame(1, WhatsAppLog::where('message_id', 'wamid.DUP')->count());
        Queue::assertPushed(ProcessWhatsAppMedia::class, 1);
        // Both deliveries are still recorded as raw events.
        $this->assertDatabaseCount('whatsapp_webhook_events', 2);
    }

    public function test_duplicate_within_one_delivery_is_processed_once(): void
    {
        $payload = $this->messagePayload('wamid.DUP');
        $payload['entry'][0]['changes'][0]['value']['messages'][] = $payload['entry'][0]['changes'][0]['value']['messages'][0];

        $this->postWebhook($payload)->assertOk();

        Queue::assertPushed(ProcessWhatsAppMedia::class, 1);
    }

    // ── Batched payloads ──

    public function test_every_entry_change_and_message_is_processed(): void
    {
        $payload = $this->messagePayload('wamid.1');
        $payload['entry'][0]['changes'][0]['value']['messages'][] = $this->textMessage('wamid.2');
        $payload['entry'][0]['changes'][] = ['field' => 'messages', 'value' => ['messages' => [$this->textMessage('wamid.3')]]];
        $payload['entry'][] = ['id' => 'WABA2', 'changes' => [['field' => 'messages', 'value' => ['messages' => [$this->textMessage('wamid.4')]]]]];

        $this->postWebhook($payload)->assertOk();

        Queue::assertPushed(ProcessWhatsAppMedia::class, 4);
        $this->assertSame(4, WhatsAppLog::where('direction', 'inbound')->count());
    }

    public function test_non_message_fields_and_other_objects_are_ignored(): void
    {
        $payload = $this->messagePayload('wamid.A');
        $payload['entry'][0]['changes'][0]['field'] = 'account_update';
        $this->postWebhook($payload)->assertOk();

        $payload = $this->messagePayload('wamid.B');
        $payload['object'] = 'page';
        $this->postWebhook($payload)->assertOk();

        Queue::assertNothingPushed();
        $this->assertDatabaseCount('whatsapp_logs', 0);
    }

    public function test_message_from_unknown_number_is_ignored(): void
    {
        $payload = $this->messagePayload('wamid.A');
        $payload['entry'][0]['changes'][0]['value']['messages'][0]['from'] = '254799999999';

        $this->postWebhook($payload)->assertOk();

        Queue::assertNothingPushed();
        $this->assertDatabaseCount('whatsapp_logs', 0);
    }

    public function test_media_messages_carry_media_id_to_the_job(): void
    {
        $payload = $this->messagePayload('wamid.IMG');
        $payload['entry'][0]['changes'][0]['value']['messages'][0] = [
            'from' => '254700000001',
            'id' => 'wamid.IMG',
            'timestamp' => '1758560000',
            'type' => 'image',
            'image' => ['id' => 'MEDIA123', 'mime_type' => 'image/png', 'caption' => 'site day 3'],
        ];

        $this->postWebhook($payload)->assertOk();

        $this->assertDatabaseHas('whatsapp_logs', ['message_id' => 'wamid.IMG', 'message' => '[Image]']);
        Queue::assertPushed(ProcessWhatsAppMedia::class, fn ($job) => $job->payload === [
            'media_type' => 'image',
            'wamid' => 'wamid.IMG',
            'media_id' => 'MEDIA123',
            'mime' => 'image/png',
            'caption' => 'site day 3',
        ]);
    }

    // ── Status callbacks ──

    public function test_status_callbacks_advance_outbound_message(): void
    {
        $log = $this->outboundLog('wamid.OUT');

        $this->postWebhook($this->statusPayload('wamid.OUT', 'delivered'))->assertOk();
        $this->assertSame('delivered', $log->fresh()->status);

        $this->postWebhook($this->statusPayload('wamid.OUT', 'read'))->assertOk();
        $this->assertSame('read', $log->fresh()->status);

        Queue::assertNothingPushed();
    }

    public function test_out_of_order_status_does_not_move_message_backwards(): void
    {
        $log = $this->outboundLog('wamid.OUT', 'read');

        $this->postWebhook($this->statusPayload('wamid.OUT', 'delivered'))->assertOk();

        $this->assertSame('read', $log->fresh()->status);
    }

    public function test_failed_status_records_the_error(): void
    {
        $log = $this->outboundLog('wamid.OUT');
        $payload = $this->statusPayload('wamid.OUT', 'failed');
        $payload['entry'][0]['changes'][0]['value']['statuses'][0]['errors'] = [
            ['code' => 131047, 'title' => 'Re-engagement message'],
        ];

        $this->postWebhook($payload)->assertOk();

        $log->refresh();
        $this->assertSame('failed', $log->status);
        $this->assertSame('131047 Re-engagement message', $log->error_message);
    }

    public function test_status_for_unknown_message_is_ignored(): void
    {
        $this->postWebhook($this->statusPayload('wamid.NOPE', 'delivered'))->assertOk();

        $this->assertDatabaseCount('whatsapp_logs', 0);
        $this->assertTrue((bool) WhatsAppWebhookEvent::first()->processed);
    }

    public function test_status_does_not_touch_inbound_message_with_same_id(): void
    {
        WhatsAppLog::create([
            'user_id' => $this->user->id,
            'phone_number' => '254700000001',
            'message' => 'Hi',
            'direction' => 'inbound',
            'status' => 'received',
            'message_id' => 'wamid.IN',
            'timestamp' => now(),
        ]);

        $this->postWebhook($this->statusPayload('wamid.IN', 'read'))->assertOk();

        $this->assertSame('received', WhatsAppLog::first()->status);
    }

    // ── Helpers ──

    private function postWebhook(array $payload, bool $signature = true): TestResponse
    {
        $body = json_encode($payload);

        return $this->postRaw($body, $signature ? 'sha256=' . hash_hmac('sha256', $body, self::SECRET) : null);
    }

    private function postRaw(string $body, ?string $signature): TestResponse
    {
        $server = ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json'];
        if ($signature !== null) {
            $server['HTTP_X_HUB_SIGNATURE_256'] = $signature;
        }

        return $this->call('POST', '/api/whatsapp/webhook', [], [], [], $server, $body);
    }

    private function messagePayload(string $messageId): array
    {
        return [
            'object' => 'whatsapp_business_account',
            'entry' => [[
                'id' => 'WABA1',
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messaging_product' => 'whatsapp',
                        'metadata' => ['display_phone_number' => '254711111111', 'phone_number_id' => 'PNID'],
                        'contacts' => [['profile' => ['name' => 'Client'], 'wa_id' => '254700000001']],
                        'messages' => [$this->textMessage($messageId)],
                    ],
                ]],
            ]],
        ];
    }

    private function textMessage(string $messageId): array
    {
        return [
            'from' => '254700000001',
            'id' => $messageId,
            'timestamp' => '1758560000',
            'type' => 'text',
            'text' => ['body' => 'Hello'],
        ];
    }

    private function statusPayload(string $messageId, string $status): array
    {
        return [
            'object' => 'whatsapp_business_account',
            'entry' => [[
                'id' => 'WABA1',
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messaging_product' => 'whatsapp',
                        'metadata' => ['display_phone_number' => '254711111111', 'phone_number_id' => 'PNID'],
                        'statuses' => [[
                            'id' => $messageId,
                            'status' => $status,
                            'timestamp' => '1758560100',
                            'recipient_id' => '254700000001',
                        ]],
                    ],
                ]],
            ]],
        ];
    }

    private function outboundLog(string $messageId, string $status = 'sent'): WhatsAppLog
    {
        return WhatsAppLog::create([
            'phone_number' => '254700000001',
            'message' => 'Got it',
            'direction' => 'outbound',
            'status' => $status,
            'message_id' => $messageId,
            'timestamp' => now(),
        ]);
    }
}
