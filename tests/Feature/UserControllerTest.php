<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->client = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_users(): void
    {
        $this->get('/users')->assertRedirect('/login');
    }

    public function test_non_admin_cannot_access_users_index(): void
    {
        $this->actingAs($this->client)
            ->get('/users')
            ->assertForbidden();
    }

    public function test_admin_can_access_users_index(): void
    {
        $this->actingAs($this->admin)
            ->get('/users')
            ->assertOk();
    }

    public function test_admin_can_create_user(): void
    {
        $this->actingAs($this->admin)
            ->post('/users', [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'john@example.com',
                'role' => 'client',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'first_name' => 'John',
        ]);
    }

    public function test_non_admin_cannot_create_user(): void
    {
        $this->actingAs($this->client)
            ->post('/users', [
                'first_name' => 'Hacker',
                'last_name' => 'Guy',
                'email' => 'hacker@example.com',
                'role' => 'admin',
                'password' => 'password123',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_update_user(): void
    {
        $this->actingAs($this->admin)
            ->put("/users/{$this->client->id}", [
                'first_name' => 'Updated',
                'last_name' => 'Client',
                'role' => 'manager',
                'status' => 'active',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $this->client->id,
            'first_name' => 'Updated',
            'role' => 'manager',
        ]);
    }

    public function test_admin_can_delete_user(): void
    {
        $this->actingAs($this->admin)
            ->delete("/users/{$this->client->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $this->client->id]);
    }

    public function test_non_admin_cannot_delete_user(): void
    {
        $this->actingAs($this->client)
            ->delete("/users/{$this->admin->id}")
            ->assertForbidden();
    }
}
