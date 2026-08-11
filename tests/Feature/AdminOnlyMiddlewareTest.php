<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOnlyMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_rejected(): void
    {
        $this->get('/users')
            ->assertRedirect('/login');
    }

    public function test_client_user_gets_403(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)
            ->get('/users')
            ->assertForbidden();
    }

    public function test_manager_user_gets_403(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager)
            ->get('/users')
            ->assertForbidden();
    }

    public function test_admin_user_can_access(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/users')
            ->assertOk();
    }

    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post('/users', [
                'first_name' => 'New',
                'last_name' => 'User',
                'email' => 'new@example.com',
                'username' => 'newuser',
                'role' => 'client',
                'password' => 'password123',
            ])
            ->assertRedirect();
    }

    public function test_client_cannot_create_user(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)
            ->post('/users', [
                'first_name' => 'Hacker',
                'last_name' => 'Guy',
                'email' => 'hacker@example.com',
                'role' => 'admin',
                'password' => 'password123',
            ])
            ->assertForbidden();
    }
}
