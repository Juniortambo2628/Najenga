<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\NewLoginNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class LoginNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_from_a_new_context_sends_a_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        Notification::assertSentTo($user, NewLoginNotification::class);
    }

    public function test_repeated_login_from_the_same_context_does_not_notify_again(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $this->post('/logout')->assertRedirect();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        Notification::assertSentTimes(NewLoginNotification::class, 1);
    }

    public function test_login_notifications_can_be_disabled(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $user->forceFill(['login_notifications_enabled' => false])->save();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        Notification::assertNotSentTo($user, NewLoginNotification::class);
    }

    public function test_login_context_is_recorded_on_sign_in(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $context = $user->fresh()->last_login_context;

        $this->assertIsArray($context);
        $this->assertArrayHasKey('ip', $context);
        $this->assertArrayHasKey('user_agent', $context);
    }

    public function test_login_notifications_preference_can_be_toggled(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/profile/login-notifications', ['enabled' => false])
            ->assertRedirect();

        $this->assertFalse($user->fresh()->login_notifications_enabled);

        $this->actingAs($user)
            ->patch('/profile/login-notifications', ['enabled' => true])
            ->assertRedirect();

        $this->assertTrue($user->fresh()->login_notifications_enabled);
    }

    public function test_login_notifications_toggle_requires_a_boolean(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from('/profile')
            ->patch('/profile/login-notifications', ['enabled' => 'nope'])
            ->assertRedirect('/profile')
            ->assertSessionHasErrors('enabled');
    }

    public function test_login_notifications_toggle_requires_authentication(): void
    {
        $this->patch('/profile/login-notifications', ['enabled' => false])
            ->assertRedirect('/login');
    }
}
