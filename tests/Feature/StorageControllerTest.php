<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorageControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_storage(): void
    {
        $this->get('/storage/test/file.txt')
            ->assertStatus(403);
    }

    public function test_authenticated_user_gets_response_for_nonexistent_file(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($user)
            ->get('/storage/nonexistent/file.txt');

        $this->assertContains($response->status(), [403, 404]);
    }
}
