<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Folder;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FolderControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->user->id]);
    }

    public function test_owner_can_update_folder(): void
    {
        $folder = Folder::factory()->create([
            'project_id' => $this->project->id,
            'name' => 'Old Name',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/folders/{$folder->id}", [
                'name' => 'New Name',
                'project_id' => $this->project->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('folders', [
            'id' => $folder->id,
            'name' => 'New Name',
        ]);
    }

    public function test_non_owner_cannot_update_folder(): void
    {
        $other = User::factory()->create();
        $otherProject = Project::factory()->create(['client_id' => $other->id]);
        $folder = Folder::factory()->create([
            'project_id' => $otherProject->id,
        ]);

        $this->actingAs($this->user)
            ->patchJson("/folders/{$folder->id}", [
                'name' => 'Hacked',
                'project_id' => $otherProject->id,
            ])
            ->assertForbidden();
    }

    public function test_owner_can_delete_folder(): void
    {
        $folder = Folder::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->user)
            ->delete("/folders/{$folder->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('folders', ['id' => $folder->id]);
    }

    public function test_deleting_folder_detaches_documents(): void
    {
        $folder = Folder::factory()->create(['project_id' => $this->project->id]);
        $document = Document::factory()->create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'folder_id' => $folder->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/folders/{$folder->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'folder_id' => null,
        ]);
    }

    public function test_non_owner_cannot_delete_folder(): void
    {
        $other = User::factory()->create();
        $otherProject = Project::factory()->create(['client_id' => $other->id]);
        $folder = Folder::factory()->create(['project_id' => $otherProject->id]);

        $this->actingAs($this->user)
            ->delete("/folders/{$folder->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('folders', ['id' => $folder->id]);
    }

    public function test_update_requires_name(): void
    {
        $folder = Folder::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->user)
            ->patchJson("/folders/{$folder->id}", [
                'name' => '',
                'project_id' => $this->project->id,
            ])
            ->assertStatus(422);
    }
}
