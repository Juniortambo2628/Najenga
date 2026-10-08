<?php

namespace Tests\Feature;

use App\Models\WhatsAppSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class WhatsAppPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_page_requires_authentication(): void
    {
        $this->get('/whatsapp')->assertRedirect('/login');
        $this->post('/whatsapp/test-connection')->assertRedirect('/login');
        $this->patch('/whatsapp/settings', ['key' => 'expense_notifications', 'enabled' => false])
            ->assertRedirect('/login');
    }

    public function test_the_page_reports_an_unconfigured_connection_by_default(): void
    {
        $this->actingAs(\App\Models\User::factory()->create())
            ->get('/whatsapp')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('WhatsApp')
                ->where('connection.configured', false)
                ->has('connection.missing', 2)
                ->where('settings.expense_notifications', true)
                ->where('settings.project_notifications', true)
                ->where('settings.document_notifications', true));
    }

    public function test_the_page_reports_a_configured_connection(): void
    {
        config([
            'services.meta.whatsapp_phone_number_id' => '111222333',
            'services.meta.whatsapp_access_token' => 'test-token',
        ]);

        $this->actingAs(\App\Models\User::factory()->create())
            ->get('/whatsapp')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('connection.configured', true)
                ->where('connection.missing', []));
    }

    public function test_connection_test_fails_when_credentials_are_missing(): void
    {
        $this->actingAs(\App\Models\User::factory()->create())
            ->postJson('/whatsapp/test-connection')
            ->assertOk()
            ->assertJson(['ok' => false]);
    }

    public function test_connection_test_succeeds_against_meta(): void
    {
        config([
            'services.meta.whatsapp_phone_number_id' => '111222333',
            'services.meta.whatsapp_access_token' => 'test-token',
        ]);
        Http::fake([
            'graph.facebook.com/*' => Http::response(['display_phone_number' => '+254717000001'], 200),
        ]);

        $this->actingAs(\App\Models\User::factory()->create())
            ->postJson('/whatsapp/test-connection')
            ->assertOk()
            ->assertJson(['ok' => true, 'message' => 'Connected to +254717000001.']);
    }

    public function test_connection_test_reports_rejected_credentials(): void
    {
        config([
            'services.meta.whatsapp_phone_number_id' => '111222333',
            'services.meta.whatsapp_access_token' => 'bad-token',
        ]);
        Http::fake([
            'graph.facebook.com/*' => Http::response(['error' => ['message' => 'Invalid OAuth']], 401),
        ]);

        $this->actingAs(\App\Models\User::factory()->create())
            ->postJson('/whatsapp/test-connection')
            ->assertOk()
            ->assertJson(['ok' => false, 'message' => 'Meta rejected the configured credentials.']);
    }

    public function test_notification_toggles_persist(): void
    {
        $user = \App\Models\User::factory()->create();

        $this->actingAs($user)
            ->from('/whatsapp')
            ->patch('/whatsapp/settings', ['key' => 'expense_notifications', 'enabled' => false])
            ->assertSessionHasNoErrors();

        $this->assertFalse(WhatsAppSetting::current()->expense_notifications);

        $this->actingAs($user)
            ->get('/whatsapp')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('settings.expense_notifications', false)
                ->where('settings.project_notifications', true));
    }

    public function test_unknown_toggle_keys_are_rejected(): void
    {
        $user = \App\Models\User::factory()->create();

        $this->actingAs($user)
            ->from('/whatsapp')
            ->patch('/whatsapp/settings', ['key' => 'bogus_notifications', 'enabled' => false])
            ->assertSessionHasErrors('key');
    }
}
