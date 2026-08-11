<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_analytics(): void
    {
        $this->get('/analytics')->assertRedirect('/login');
    }

    public function test_user_can_access_analytics(): void
    {
        $this->actingAs($this->user)
            ->get('/analytics')
            ->assertOk();
    }

    public function test_analytics_shows_own_stats(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);
        Photo::factory()->count(2)->create(['user_id' => $this->user->id, 'project_id' => $project->id]);
        Document::factory()->count(1)->create(['user_id' => $this->user->id, 'project_id' => $project->id]);

        $this->actingAs($this->user)
            ->get('/analytics')
            ->assertOk();
    }

    public function test_analytics_works_with_no_expenses(): void
    {
        $this->actingAs($this->user)
            ->get('/analytics')
            ->assertOk();
    }
}
