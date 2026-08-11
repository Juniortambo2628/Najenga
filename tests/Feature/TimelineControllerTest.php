<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimelineControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $this->otherUser = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->user->id]);
    }

    public function test_unauthenticated_user_cannot_access_timeline(): void
    {
        $this->get('/timeline')->assertRedirect('/login');
    }

    public function test_user_can_view_timeline_index(): void
    {
        ProjectTimeline::factory()->count(3)->create([
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->get('/timeline')
            ->assertOk();
    }

    public function test_user_can_create_timeline_event(): void
    {
        $this->actingAs($this->user)
            ->post('/timelines', [
                'title' => 'Foundation Complete',
                'description' => 'Foundation work is done',
                'project_id' => $this->project->id,
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-15',
                'status' => 'completed',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('project_timelines', [
            'title' => 'Foundation Complete',
            'project_id' => $this->project->id,
        ]);
    }

    public function test_user_cannot_create_timeline_without_required_fields(): void
    {
        $this->actingAs($this->user)
            ->post('/timelines', [
                'description' => 'Missing title and project',
            ])
            ->assertRedirect();
    }

    public function test_user_can_update_own_timeline(): void
    {
        $timeline = ProjectTimeline::factory()->create([
            'project_id' => $this->project->id,
            'start_date' => '2026-08-01',
            'status' => 'pending',
        ]);

        $this->actingAs($this->user)
            ->patch("/timelines/{$timeline->id}", [
                'title' => 'Updated Milestone',
                'start_date' => '2026-08-01',
                'status' => 'in_progress',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('project_timelines', [
            'id' => $timeline->id,
            'title' => 'Updated Milestone',
        ]);
    }

    public function test_user_cannot_update_other_users_timeline(): void
    {
        $otherProject = Project::factory()->create(['client_id' => $this->otherUser->id]);
        $timeline = ProjectTimeline::factory()->create([
            'project_id' => $otherProject->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/timelines/{$timeline->id}", [
                'title' => 'Hacked',
                'start_date' => '2026-08-01',
                'status' => 'pending',
            ])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_timeline(): void
    {
        $timeline = ProjectTimeline::factory()->create([
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/timelines/{$timeline->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('project_timelines', ['id' => $timeline->id]);
    }

    public function test_user_cannot_delete_other_users_timeline(): void
    {
        $otherProject = Project::factory()->create(['client_id' => $this->otherUser->id]);
        $timeline = ProjectTimeline::factory()->create([
            'project_id' => $otherProject->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/timelines/{$timeline->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('project_timelines', ['id' => $timeline->id]);
    }
}
