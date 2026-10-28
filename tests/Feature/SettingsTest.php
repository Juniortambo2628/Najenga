<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\NewActivityNotification;
use App\Notifications\WhatsAppWeeklyDigest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_settings_page_shows_preferences_with_defaults_and_the_asked_for_section(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/settings?section=preferences')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Profile/Edit')
                ->where('section', 'preferences')
                ->where('preferences', User::PREFERENCE_DEFAULTS));
    }

    public function test_the_old_profile_address_lands_on_settings(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/profile')
            ->assertRedirect('/settings');
    }

    public function test_preferences_save_only_the_keys_sent(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->patch('/settings/preferences', ['currency' => 'USD'])->assertSessionHasNoErrors();
        $this->actingAs($user)->patch('/settings/preferences', ['weekly_digest' => false])->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertSame('USD', $user->preference('currency'));
        $this->assertFalse($user->preference('weekly_digest'));
        $this->assertTrue($user->preference('activity_notifications'));
    }

    public function test_preferences_are_validated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/settings/preferences', ['currency' => 'XYZ', 'activity_notifications' => 'maybe'])
            ->assertSessionHasErrors(['currency', 'activity_notifications']);

        $this->assertNull($user->fresh()->preferences);
    }

    public function test_new_expenses_start_in_the_default_currency(): void
    {
        $user = User::factory()->create(['role' => 'admin', 'preferences' => ['currency' => 'UGX']]);
        $project = \App\Models\Project::factory()->create(['client_id' => $user->id]);

        $this->actingAs($user)->post('/expenses', [
            'project_id' => $project->id,
            'title' => 'Sand',
            'amount' => 1000,
            'category' => 'materials',
            'expense_date' => '2026-10-20',
            'payment_method' => 'cash',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('expenses', ['title' => 'Sand', 'currency' => 'UGX']);
    }

    public function test_activity_notifications_can_be_turned_off(): void
    {
        $on = User::factory()->create();
        $off = User::factory()->create(['preferences' => ['activity_notifications' => false]]);
        $notification = new NewActivityNotification(['message' => 'x']);

        $this->assertSame(['database'], $notification->via($on));
        $this->assertSame([], $notification->via($off));
    }
}
