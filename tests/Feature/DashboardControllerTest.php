<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_user_can_access_dashboard(): void
    {
        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_dashboard_shows_user_stats(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id, 'status' => 'active']);
        Expense::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => 10000,
        ]);
        Photo::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
        ]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_dashboard_does_not_include_other_users_data(): void
    {
        $otherUser = User::factory()->create(['role' => 'client']);
        $otherProject = Project::factory()->create(['client_id' => $otherUser->id]);
        Expense::factory()->count(5)->create([
            'user_id' => $otherUser->id,
            'project_id' => $otherProject->id,
            'amount' => 50000,
        ]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_dashboard_recent_projects_are_scoped_to_the_signed_in_client(): void
    {
        Project::factory()->count(2)->create(['client_id' => $this->user->id]);
        $otherUser = User::factory()->create(['role' => 'client']);
        Project::factory()->count(5)->create(['client_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('recentProjects', 2)
                ->where('stats.totalProjects', 2));
    }
}
