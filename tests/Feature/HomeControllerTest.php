<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_home(): void
    {
        $this->get('/home')->assertRedirect('/login');
    }

    public function test_user_can_access_home(): void
    {
        $this->actingAs($this->user)
            ->get('/home')
            ->assertOk();
    }

    public function test_home_shows_own_projects(): void
    {
        Project::factory()->count(3)->create(['client_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->get('/home')
            ->assertOk();
    }

    public function test_home_does_not_show_other_users_projects(): void
    {
        $other = User::factory()->create();
        Project::factory()->count(2)->create(['client_id' => $this->user->id]);
        Project::factory()->count(5)->create(['client_id' => $other->id]);

        $this->actingAs($this->user)
            ->get('/home')
            ->assertOk();
    }
}
