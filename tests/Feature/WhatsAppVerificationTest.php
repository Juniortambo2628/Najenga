<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WhatsAppLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class WhatsAppVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.meta.whatsapp_phone_number_id' => '111222333',
            'services.meta.whatsapp_access_token' => 'test-token',
        ]);
    }

    private function fakeSuccessfulSend(?string &$captured = null): void
    {
        Http::fake(function ($request) use (&$captured) {
            $captured = $request->body();

            return Http::response([], 200);
        });
    }

    private function sentCode(string $captured): string
    {
        preg_match('/code is (\d{6})/', $captured, $matches);

        $this->assertNotEmpty($matches[1] ?? null, 'No six-digit code found in the sent WhatsApp message.');

        return $matches[1];
    }

    public function test_verification_endpoints_require_authentication(): void
    {
        $this->post('/profile/whatsapp/send-code')->assertRedirect('/login');
        $this->post('/profile/whatsapp/verify', ['code' => '123456'])->assertRedirect('/login');
    }

    public function test_sending_a_code_requires_a_recipient_number(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/send-code')
            ->assertSessionHasErrors('whatsapp');

        $this->assertNull(Cache::get("whatsapp.verify.{$user->id}"));
    }

    public function test_sending_a_code_dispatches_it_over_whatsapp(): void
    {
        $user = User::factory()->create(['phone' => '0717000001']);
        $captured = '';
        $this->fakeSuccessfulSend($captured);

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/send-code')
            ->assertSessionHasNoErrors()
            ->assertSessionHas('status', 'whatsapp-code-sent');

        Http::assertSent(fn ($request) => str_contains($request->url(), 'graph.facebook.com'));
        $this->assertMatchesRegularExpression('/\d{6}/', $captured);

        $payload = Cache::get("whatsapp.verify.{$user->id}");
        $this->assertNotNull($payload);
        $this->assertSame('0717000001', $payload['digits']);

        $this->assertDatabaseHas('whatsapp_logs', [
            'phone_number' => '+0717000001',
            'direction' => 'outbound',
            'status' => 'sent',
        ]);
    }

    public function test_the_whatsapp_id_is_used_when_no_phone_is_set(): void
    {
        $user = User::factory()->create(['whatsapp_wa_id' => '254717000001']);
        $this->fakeSuccessfulSend();

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/send-code')
            ->assertSessionHasNoErrors();

        $payload = Cache::get("whatsapp.verify.{$user->id}");
        $this->assertSame('254717000001', $payload['digits']);
    }

    public function test_a_rejected_api_call_reports_an_error(): void
    {
        $user = User::factory()->create(['phone' => '0717000001']);
        Http::fake(fn () => Http::response('boom', 500));

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/send-code')
            ->assertSessionHasErrors('whatsapp');

        $this->assertNull(Cache::get("whatsapp.verify.{$user->id}"));

        $this->assertDatabaseHas('whatsapp_logs', [
            'phone_number' => '+0717000001',
            'status' => 'failed',
        ]);
    }

    public function test_code_requests_are_rate_limited(): void
    {
        $user = User::factory()->create(['phone' => '0717000001']);
        $this->fakeSuccessfulSend();

        foreach (range(1, 3) as $ignored) {
            $this->actingAs($user)->post('/profile/whatsapp/send-code')->assertSessionHasNoErrors();
        }

        $this->actingAs($user)->post('/profile/whatsapp/send-code')->assertStatus(429);
    }

    public function test_a_wrong_code_is_rejected_and_allows_retries(): void
    {
        $user = User::factory()->create(['phone' => '0717000001']);
        $captured = '';
        $this->fakeSuccessfulSend($captured);
        $this->actingAs($user)->post('/profile/whatsapp/send-code');
        $code = $this->sentCode($captured);

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/verify', ['code' => $code === '000000' ? '111111' : '000000'])
            ->assertSessionHasErrors('code');

        $this->assertNull($user->fresh()->whatsapp_verified_at);
        $this->assertNotNull(Cache::get("whatsapp.verify.{$user->id}"));
    }

    public function test_an_expired_code_is_rejected(): void
    {
        $user = User::factory()->create(['phone' => '0717000001']);
        $captured = '';
        $this->fakeSuccessfulSend($captured);
        $this->actingAs($user)->post('/profile/whatsapp/send-code');
        $code = $this->sentCode($captured);

        $this->travel(11)->minutes();

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/verify', ['code' => $code])
            ->assertSessionHasErrors('code');

        $this->assertNull($user->fresh()->whatsapp_verified_at);
        $this->assertNull(Cache::get("whatsapp.verify.{$user->id}"));
    }

    public function test_a_correct_code_verifies_whatsapp_once(): void
    {
        $user = User::factory()->create(['phone' => '0717000001']);
        $captured = '';
        $this->fakeSuccessfulSend($captured);
        $this->actingAs($user)->post('/profile/whatsapp/send-code');
        $code = $this->sentCode($captured);

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/verify', ['code' => $code])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('status', 'whatsapp-verified');

        $this->assertNotNull($user->fresh()->whatsapp_verified_at);
        $this->assertNull(Cache::get("whatsapp.verify.{$user->id}"));

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/verify', ['code' => $code])
            ->assertSessionHasErrors('code');
    }

    public function test_the_code_must_be_six_digits(): void
    {
        $user = User::factory()->create(['phone' => '0717000001']);

        $this->actingAs($user)
            ->from('/profile')
            ->post('/profile/whatsapp/verify', ['code' => '12345'])
            ->assertSessionHasErrors('code');
    }

    public function test_profile_page_reports_whatsapp_state(): void
    {
        $user = User::factory()->create(['phone' => '0717 000 001']);

        $this->actingAs($user)
            ->get('/settings')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Profile/Edit')
                ->where('whatsapp.phone', '+0717000001')
                ->where('whatsapp.verified', false));

        $user->forceFill(['whatsapp_verified_at' => now()])->save();

        $this->actingAs($user)
            ->get('/settings')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('whatsapp.verified', true));
    }
}
