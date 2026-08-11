<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Folder;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentControllerTest extends TestCase
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

    public function test_unauthenticated_user_cannot_access_documents(): void
    {
        $this->get('/documents')->assertRedirect('/login');
    }

    public function test_user_can_view_documents_index(): void
    {
        Document::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->get('/documents')
            ->assertOk();
    }

    public function test_user_can_update_document(): void
    {
        $document = Document::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/documents/{$document->id}", [
                'title' => 'Updated Document',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'title' => 'Updated Document',
        ]);
    }

    public function test_user_cannot_update_other_users_document(): void
    {
        $document = Document::factory()->create([
            'user_id' => $this->otherUser->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/documents/{$document->id}", ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_document(): void
    {
        $document = Document::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/documents/{$document->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
    }

    public function test_user_cannot_delete_other_users_document(): void
    {
        $document = Document::factory()->create([
            'user_id' => $this->otherUser->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/documents/{$document->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('documents', ['id' => $document->id]);
    }

    public function test_user_can_view_document(): void
    {
        $document = Document::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->get("/documents/{$document->id}")
            ->assertOk()
            ->assertJson(['id' => $document->id]);
    }

    public function test_user_can_move_document_to_folder(): void
    {
        $folder = Folder::factory()->create(['project_id' => $this->project->id]);
        $document = Document::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/documents/{$document->id}/move", [
                'folder_id' => $folder->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'folder_id' => $folder->id,
        ]);
    }

    public function test_user_can_create_folder(): void
    {
        $this->actingAs($this->user)
            ->post('/folders', [
                'name' => 'Test Folder',
                'project_id' => $this->project->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('folders', [
            'name' => 'Test Folder',
            'project_id' => $this->project->id,
        ]);
    }

    public function test_user_can_delete_folder(): void
    {
        $folder = Folder::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->user)
            ->delete("/folders/{$folder->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('folders', ['id' => $folder->id]);
    }
}
