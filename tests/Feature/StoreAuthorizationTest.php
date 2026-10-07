<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Folder;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StoreAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $outsider;
    private Project $project;
    private Project $otherProject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = User::factory()->create(['role' => 'client']);
        $this->outsider = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->owner->id]);
        $this->otherProject = Project::factory()->create(['client_id' => $this->outsider->id]);
    }

    public function test_user_cannot_create_expense_in_another_users_project(): void
    {
        $this->actingAs($this->outsider)
            ->post('/expenses', [
                'title' => 'Sneaky Expense',
                'amount' => 100,
                'category' => 'office',
                'project_id' => $this->project->id,
                'expense_date' => '2026-08-01',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('expenses', ['title' => 'Sneaky Expense']);
    }

    public function test_project_member_can_create_expense(): void
    {
        $this->project->users()->attach($this->outsider->id, ['role' => 'editor']);

        $this->actingAs($this->outsider)
            ->post('/expenses', [
                'title' => 'Member Expense',
                'amount' => 250,
                'category' => 'materials',
                'project_id' => $this->project->id,
                'expense_date' => '2026-08-02',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', ['title' => 'Member Expense']);
    }

    public function test_user_cannot_create_timeline_in_another_users_project(): void
    {
        $this->actingAs($this->outsider)
            ->post('/timelines', [
                'title' => 'Sneaky Milestone',
                'project_id' => $this->project->id,
                'start_date' => '2026-08-01',
                'status' => 'pending',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('project_timelines', ['title' => 'Sneaky Milestone']);
    }

    public function test_batch_expense_rows_cannot_target_another_users_project(): void
    {
        $this->actingAs($this->outsider)
            ->post('/expenses/batch', [
                'expenses' => [
                    [
                        'title' => 'Allowed Row',
                        'amount' => 10,
                        'category' => 'office',
                        'expense_date' => '2026-08-01',
                    ],
                    [
                        'title' => 'Foreign Row',
                        'amount' => 20,
                        'category' => 'office',
                        'expense_date' => '2026-08-01',
                        'project_id' => $this->project->id,
                    ],
                ],
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('expenses', ['title' => 'Foreign Row']);
        $this->assertDatabaseMissing('expenses', ['title' => 'Allowed Row']);
    }

    public function test_user_cannot_upload_documents_to_another_users_project(): void
    {
        Storage::fake('public');

        $this->actingAs($this->outsider)
            ->post('/documents', [
                'documents' => [UploadedFile::fake()->createWithContent('sneaky.txt', 'nope')],
                'project_id' => $this->project->id,
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('documents', ['original_name' => 'sneaky.txt']);
    }

    public function test_user_cannot_upload_documents_into_a_folder_from_another_project(): void
    {
        Storage::fake('public');
        $foreignFolder = Folder::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->outsider)
            ->post('/documents', [
                'documents' => [UploadedFile::fake()->createWithContent('sneaky.txt', 'nope')],
                'project_id' => $this->otherProject->id,
                'folder_id' => $foreignFolder->id,
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('documents', ['original_name' => 'sneaky.txt']);
    }

    public function test_user_cannot_upload_photos_to_another_users_project(): void
    {
        Storage::fake('public');

        $this->actingAs($this->outsider)
            ->post('/photos', [
                'photos' => [UploadedFile::fake()->image('sneaky.jpg')],
                'project_id' => $this->project->id,
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('photos', ['original_name' => 'sneaky.jpg']);
    }

    public function test_unknown_project_id_is_a_validation_error_not_a_403(): void
    {
        $this->actingAs($this->outsider)
            ->from('/expenses')
            ->post('/expenses', [
                'title' => 'Ghost Expense',
                'amount' => 100,
                'category' => 'office',
                'project_id' => 999999,
                'expense_date' => '2026-08-01',
            ])
            ->assertRedirect('/expenses')
            ->assertSessionHasErrors('project_id');

        $this->assertDatabaseMissing('expenses', ['title' => 'Ghost Expense']);
    }

    public function test_user_cannot_move_another_users_document(): void
    {
        $folder = Folder::factory()->create(['project_id' => $this->project->id]);
        $document = Document::factory()->create([
            'user_id' => $this->owner->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->outsider)
            ->patch("/documents/{$document->id}/move", ['folder_id' => $folder->id])
            ->assertForbidden();
    }

    public function test_document_cannot_be_moved_to_a_folder_in_another_project(): void
    {
        $foreignFolder = Folder::factory()->create(['project_id' => $this->otherProject->id]);
        $document = Document::factory()->create([
            'user_id' => $this->owner->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->owner)
            ->patch("/documents/{$document->id}/move", ['folder_id' => $foreignFolder->id])
            ->assertSessionHasErrors('folder_id');

        $this->assertDatabaseMissing('documents', [
            'id' => $document->id,
            'folder_id' => $foreignFolder->id,
        ]);
    }
}
