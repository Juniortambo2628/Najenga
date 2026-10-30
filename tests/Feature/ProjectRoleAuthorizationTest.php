<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Project roles decide what a member may do in a shared project: owner
 * (the client), a co-owner (e.g. its manager) and an editor can change it; a
 * viewer can read and comment only. Members are managed by the owners.
 */
class ProjectRoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $manager;
    private User $editor;
    private User $viewer;
    private User $stranger;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = User::factory()->create(['role' => 'client']);
        $this->manager = User::factory()->create(['role' => 'client']);
        $this->editor = User::factory()->create(['role' => 'client']);
        $this->viewer = User::factory()->create(['role' => 'client']);
        $this->stranger = User::factory()->create(['role' => 'client']);

        $this->project = Project::factory()->create(['client_id' => $this->owner->id]);
        $this->project->users()->attach($this->manager->id, ['role' => 'owner']);
        $this->project->users()->attach($this->editor->id, ['role' => 'editor']);
        $this->project->users()->attach($this->viewer->id, ['role' => 'viewer']);
    }

    public function test_role_for_each_kind_of_user(): void
    {
        $this->assertSame('owner', $this->project->roleFor($this->owner));
        $this->assertSame('owner', $this->project->roleFor($this->manager));
        $this->assertSame('editor', $this->project->roleFor($this->editor));
        $this->assertSame('viewer', $this->project->roleFor($this->viewer));
        $this->assertNull($this->project->roleFor($this->stranger));
    }

    // Project updates

    public function test_viewer_cannot_update_project(): void
    {
        $this->actingAs($this->viewer)
            ->patch("/projects/{$this->project->id}", ['name' => 'Renamed by viewer'])
            ->assertForbidden();

        $this->assertDatabaseMissing('projects', ['name' => 'Renamed by viewer']);
    }

    public function test_editor_and_co_owner_can_update_project(): void
    {
        foreach (['editor', 'manager'] as $role) {
            $this->actingAs($this->{$role})
                ->patch("/projects/{$this->project->id}", ['name' => "Renamed by {$role}"])
                ->assertRedirect();

            $this->assertDatabaseHas('projects', ['id' => $this->project->id, 'name' => "Renamed by {$role}"]);
        }
    }

    public function test_viewer_can_still_view_and_comment(): void
    {
        $this->actingAs($this->viewer)
            ->get("/projects/{$this->project->id}")
            // A project's page is its overview, with the project picked.
            ->assertRedirect("/overview?project={$this->project->id}");

        $this->actingAs($this->viewer)
            ->postJson('/comments', [
                'commentable_type' => 'project',
                'commentable_id' => $this->project->id,
                'body' => 'Looks good',
            ])
            ->assertSuccessful();

        // Other members hear about it (this used to 500: the actor arrived as a name).
        $this->assertSame(1, $this->editor->notifications()->count());
        $this->assertSame($this->viewer->name, $this->editor->notifications()->first()->data['user_name']);
    }

    // Members

    public function test_only_owners_can_add_members(): void
    {
        $newcomer = User::factory()->create();

        foreach (['viewer', 'editor'] as $role) {
            $this->actingAs($this->{$role})
                ->postJson("/projects/{$this->project->id}/invitations", ['email' => $newcomer->email, 'role' => 'editor'])
                ->assertForbidden();
        }

        $this->actingAs($this->manager)
            ->postJson("/projects/{$this->project->id}/invitations", ['email' => $newcomer->email, 'role' => 'viewer'])
            ->assertOk();

        $this->assertDatabaseHas('project_user', [
            'project_id' => $this->project->id,
            'user_id' => $newcomer->id,
            'role' => 'viewer',
        ]);
    }

    public function test_viewer_and_editor_cannot_remove_members(): void
    {
        foreach (['viewer', 'editor'] as $role) {
            $this->actingAs($this->{$role})
                ->deleteJson("/projects/{$this->project->id}/share/{$this->manager->id}")
                ->assertForbidden();
        }

        $this->assertDatabaseHas('project_user', ['project_id' => $this->project->id, 'user_id' => $this->manager->id]);
    }

    // Creating records under the project

    public function test_viewer_cannot_create_records_in_project(): void
    {
        Storage::fake('public');

        $this->actingAs($this->viewer)->post('/expenses', [
            'title' => 'Viewer Expense',
            'amount' => 10,
            'category' => 'materials',
            'project_id' => $this->project->id,
            'expense_date' => '2026-08-01',
        ])->assertForbidden();

        $this->actingAs($this->viewer)->post('/expenses/batch', [
            'expenses' => [[
                'title' => 'Viewer Batch Expense',
                'amount' => 10,
                'category' => 'materials',
                'project_id' => $this->project->id,
                'expense_date' => '2026-08-01',
            ]],
        ])->assertForbidden();

        $this->actingAs($this->viewer)->post('/documents', [
            'documents' => [UploadedFile::fake()->createWithContent('viewer.txt', 'nope')],
            'project_id' => $this->project->id,
        ])->assertForbidden();

        $this->actingAs($this->viewer)->post('/photos', [
            'photos' => [UploadedFile::fake()->image('viewer.jpg')],
            'project_id' => $this->project->id,
        ])->assertForbidden();

        $this->actingAs($this->viewer)->post('/timelines', [
            'title' => 'Viewer Milestone',
            'project_id' => $this->project->id,
            'start_date' => '2026-08-01',
            'status' => 'pending',
        ])->assertForbidden();

        $this->actingAs($this->viewer)->post('/folders', [
            'name' => 'Viewer Folder',
            'project_id' => $this->project->id,
        ])->assertForbidden();

        $this->assertDatabaseMissing('expenses', ['title' => 'Viewer Expense']);
        $this->assertDatabaseMissing('expenses', ['title' => 'Viewer Batch Expense']);
        $this->assertDatabaseMissing('documents', ['original_name' => 'viewer.txt']);
        $this->assertDatabaseMissing('photos', ['original_name' => 'viewer.jpg']);
        $this->assertDatabaseMissing('project_timelines', ['title' => 'Viewer Milestone']);
        $this->assertDatabaseMissing('folders', ['name' => 'Viewer Folder']);
    }

    public function test_editor_can_create_expense_in_project(): void
    {
        $this->actingAs($this->editor)->post('/expenses', [
            'title' => 'Editor Expense',
            'amount' => 10,
            'category' => 'materials',
            'project_id' => $this->project->id,
            'expense_date' => '2026-08-01',
        ])->assertRedirect();

        $this->assertDatabaseHas('expenses', ['title' => 'Editor Expense', 'project_id' => $this->project->id]);
    }

    public function test_viewer_and_stranger_cannot_file_receipts_into_project(): void
    {
        foreach (['viewer', 'stranger'] as $role) {
            $this->actingAs($this->{$role})->postJson('/receipts/store', [
                'title' => "Receipt by {$role}",
                'expense_date' => '2026-08-01',
                'project_id' => $this->project->id,
                'temp_path' => 'receipts/temp/none.jpg',
            ])->assertForbidden();

            $this->actingAs($this->{$role})->postJson('/receipts/store-bulk', [
                'expenses' => [[
                    'title' => "Bulk receipt by {$role}",
                    'expense_date' => '2026-08-01',
                    'project_id' => $this->project->id,
                    'temp_path' => 'receipts/temp/none.jpg',
                ]],
            ])->assertForbidden();
        }

        $this->assertDatabaseMissing('expenses', ['project_id' => $this->project->id]);
    }

    public function test_viewer_and_stranger_cannot_move_expenses_into_project(): void
    {
        foreach (['viewer', 'stranger'] as $role) {
            $own = Expense::factory()->create(['user_id' => $this->{$role}->id, 'project_id' => null]);

            $this->actingAs($this->{$role})
                ->patchJson('/expenses/batch/project', ['ids' => [$own->id], 'project_id' => $this->project->id])
                ->assertForbidden();

            $this->assertNull($own->fresh()->project_id);
        }
    }

    // Changing records under the project, including one's own

    public function test_viewer_cannot_change_or_delete_their_own_records_in_project(): void
    {
        // Created while they were an editor, say; they are a viewer now.
        $expense = Expense::factory()->create(['user_id' => $this->viewer->id, 'project_id' => $this->project->id]);
        $photo = Photo::factory()->create(['user_id' => $this->viewer->id, 'project_id' => $this->project->id]);

        $this->actingAs($this->viewer)
            ->patch("/expenses/{$expense->id}", ['title' => 'Changed by viewer'])
            ->assertForbidden();

        $this->actingAs($this->viewer)
            ->delete("/expenses/{$expense->id}")
            ->assertForbidden();

        $this->actingAs($this->viewer)
            ->delete("/photos/{$photo->id}")
            ->assertForbidden();

        $this->actingAs($this->viewer)
            ->deleteJson('/expenses/batch', ['ids' => [$expense->id]])
            ->assertOk()
            ->assertJson(['deleted' => 0]);

        $this->actingAs($this->viewer)
            ->patchJson('/expenses/batch/project', ['ids' => [$expense->id], 'project_id' => null])
            ->assertOk()
            ->assertJson(['updated' => 0]);

        $this->assertDatabaseHas('expenses', ['id' => $expense->id, 'project_id' => $this->project->id]);
        $this->assertDatabaseHas('photos', ['id' => $photo->id]);
        $this->assertNotSame('Changed by viewer', $expense->fresh()->title);
    }

    public function test_editor_can_change_and_delete_their_own_records_in_project(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->editor->id, 'project_id' => $this->project->id]);
        $other = Expense::factory()->create(['user_id' => $this->editor->id, 'project_id' => $this->project->id]);

        $this->actingAs($this->editor)
            ->patch("/expenses/{$expense->id}", ['title' => 'Changed by editor'])
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', ['id' => $expense->id, 'title' => 'Changed by editor']);

        $this->actingAs($this->editor)
            ->deleteJson('/expenses/batch', ['ids' => [$other->id]])
            ->assertOk()
            ->assertJson(['deleted' => 1]);
    }

    public function test_members_cannot_change_milestones_they_do_not_own(): void
    {
        $milestone = ProjectTimeline::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->viewer)
            ->delete("/timelines/{$milestone->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('project_timelines', ['id' => $milestone->id]);
    }
}
