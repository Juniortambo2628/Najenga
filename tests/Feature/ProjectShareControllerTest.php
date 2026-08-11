<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectShareControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $collaborator;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = User::factory()->create(['role' => 'client']);
        $this->collaborator = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->owner->id]);
    }

    public function test_owner_can_share_project(): void
    {
        $this->actingAs($this->owner)
            ->postJson("/projects/{$this->project->id}/share", [
                'email' => $this->collaborator->email,
                'role' => 'viewer',
            ])
            ->assertOk();

        $this->assertDatabaseHas('project_user', [
            'project_id' => $this->project->id,
            'user_id' => $this->collaborator->id,
            'role' => 'viewer',
        ]);
    }

    public function test_non_owner_cannot_share_project(): void
    {
        $this->actingAs($this->collaborator)
            ->postJson("/projects/{$this->project->id}/share", [
                'email' => $this->owner->email,
                'role' => 'viewer',
            ])
            ->assertForbidden();
    }

    public function test_owner_can_unshare_project(): void
    {
        $this->project->users()->attach($this->collaborator->id, ['role' => 'viewer']);

        $this->actingAs($this->owner)
            ->deleteJson("/projects/{$this->project->id}/share/{$this->collaborator->id}")
            ->assertOk();

        $this->assertDatabaseMissing('project_user', [
            'project_id' => $this->project->id,
            'user_id' => $this->collaborator->id,
        ]);
    }

    public function test_collaborator_can_view_shared_project(): void
    {
        $this->project->users()->attach($this->collaborator->id, ['role' => 'viewer']);

        $this->actingAs($this->collaborator)
            ->get("/projects/{$this->project->id}")
            ->assertOk();
    }

    public function test_collaborator_with_editor_role_can_update_project(): void
    {
        $this->project->users()->attach($this->collaborator->id, ['role' => 'editor']);

        $this->actingAs($this->collaborator)
            ->patch("/projects/{$this->project->id}", [
                'name' => 'Updated by Collaborator',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('projects', [
            'id' => $this->project->id,
            'name' => 'Updated by Collaborator',
        ]);
    }

    public function test_collaborator_cannot_delete_project(): void
    {
        $this->project->users()->attach($this->collaborator->id, ['role' => 'editor']);

        $this->actingAs($this->collaborator)
            ->delete("/projects/{$this->project->id}")
            ->assertForbidden();
    }

    public function test_cannot_share_with_nonexistent_email(): void
    {
        $this->actingAs($this->owner)
            ->postJson("/projects/{$this->project->id}/share", [
                'email' => 'nonexistent@example.com',
                'role' => 'viewer',
            ])
            ->assertUnprocessable();
    }
}
