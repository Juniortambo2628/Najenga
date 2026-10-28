<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $this->otherUser = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_projects(): void
    {
        $this->get('/projects')->assertRedirect('/login');
    }

    public function test_user_can_view_projects_index(): void
    {
        Project::factory()->count(3)->create(['client_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->get('/projects')
            ->assertOk();
    }

    public function test_user_can_create_project(): void
    {
        $this->actingAs($this->user)
            ->post('/projects', [
                'name' => 'Test Project',
                'description' => 'A test project',
                'status' => 'active',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'budget' => 500000,
                'currency' => 'KES',
                'location' => 'Nairobi',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'client_id' => $this->user->id,
        ]);
    }

    public function test_user_cannot_create_project_without_name(): void
    {
        $this->actingAs($this->user)
            ->post('/projects', [
                'description' => 'No name project',
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('projects', [
            'description' => 'No name project',
        ]);
    }

    public function test_user_can_view_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->get("/projects/{$project->id}")
            ->assertOk();
    }

    public function test_user_cannot_view_other_users_private_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->get("/projects/{$project->id}")
            ->assertForbidden();
    }

    public function test_user_can_update_own_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->patch("/projects/{$project->id}", [
                'name' => 'Updated Project',
                'status' => 'completed',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project',
        ]);
    }

    public function test_user_cannot_update_other_users_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->patch("/projects/{$project->id}", ['name' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_owner_can_delete_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->delete("/projects/{$project->id}")
            ->assertRedirect();

        $this->assertSoftDeleted('projects', ['id' => $project->id]);
    }

    public function test_non_owner_cannot_delete_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->delete("/projects/{$project->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('projects', ['id' => $project->id]);
    }

    public function test_a_deleted_project_goes_to_the_trash_with_its_records_and_files(): void
    {
        Storage::fake('public');

        $project = Project::factory()->create(['client_id' => $this->user->id]);
        $photo = Photo::factory()->create([
            'project_id' => $project->id,
            'user_id' => $this->user->id,
        ]);
        $photo->addMedia(UploadedFile::fake()->image('site.jpg'))
            ->usingName('site.jpg')
            ->toMediaCollection('photos');
        $expense = Expense::factory()->create([
            'project_id' => $project->id,
            'user_id' => $this->user->id,
        ]);
        $deletedEarlier = Expense::factory()->create(['project_id' => $project->id, 'user_id' => $this->user->id]);
        $deletedEarlier->delete();

        $this->travel(5)->minutes();
        $this->actingAs($this->user)
            ->delete("/projects/{$project->id}")
            ->assertRedirect();

        $this->assertSoftDeleted('projects', ['id' => $project->id]);
        $this->assertSoftDeleted('photos', ['id' => $photo->id]);
        $this->assertSoftDeleted('expenses', ['id' => $expense->id]);
        $this->assertSame(1, Media::where('model_type', Photo::class)->where('model_id', $photo->id)->count());

        // Restoring brings back what went with it, not what was deleted before.
        Project::withTrashed()->find($project->id)->restore();
        $this->assertNotSoftDeleted('photos', ['id' => $photo->id]);
        $this->assertNotSoftDeleted('expenses', ['id' => $expense->id]);
        $this->assertSoftDeleted('expenses', ['id' => $deletedEarlier->id]);
    }

    public function test_after_30_days_in_the_trash_a_project_and_its_files_are_gone(): void
    {
        Storage::fake('public');

        $project = Project::factory()->create(['client_id' => $this->user->id]);
        $photo = Photo::factory()->create(['project_id' => $project->id, 'user_id' => $this->user->id]);
        $photo->addMedia(UploadedFile::fake()->image('site.jpg'))->toMediaCollection('photos');
        $project->delete();

        $this->travel(29)->days();
        $this->artisan('model:prune', ['--model' => [Project::class]])->assertSuccessful();
        $this->assertSoftDeleted('projects', ['id' => $project->id]);

        $this->travel(2)->days();
        $this->artisan('model:prune', ['--model' => [Project::class]])->assertSuccessful();
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseMissing('photos', ['id' => $photo->id]);
        $this->assertSame(0, Media::where('model_type', Photo::class)->where('model_id', $photo->id)->count());
    }

    public function test_user_can_share_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->postJson("/projects/{$project->id}/share", [
                'email' => $this->otherUser->email,
                'role' => 'viewer',
            ])
            ->assertOk();

        $this->assertDatabaseHas('project_user', [
            'project_id' => $project->id,
            'user_id' => $this->otherUser->id,
            'role' => 'viewer',
        ]);
    }

    public function test_user_can_unshare_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);
        $project->users()->attach($this->otherUser->id, ['role' => 'viewer']);

        $this->actingAs($this->user)
            ->deleteJson("/projects/{$project->id}/share/{$this->otherUser->id}")
            ->assertOk();

        $this->assertDatabaseMissing('project_user', [
            'project_id' => $project->id,
            'user_id' => $this->otherUser->id,
        ]);
    }

    public function test_non_owner_cannot_share_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->postJson("/projects/{$project->id}/share", [
                'email' => $this->user->email,
                'role' => 'viewer',
            ])
            ->assertForbidden();
    }

    public function test_shared_user_can_view_project(): void
    {
        $project = Project::factory()->create(['client_id' => $this->otherUser->id]);
        $project->users()->attach($this->user->id, ['role' => 'viewer']);

        $this->actingAs($this->user)
            ->get("/projects/{$project->id}")
            ->assertOk();
    }

    public function test_project_users_endpoint(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);
        $project->users()->attach($this->otherUser->id, ['role' => 'editor']);

        $this->actingAs($this->user)
            ->getJson("/projects/{$project->id}/users")
            ->assertOk()
            ->assertJsonCount(2);
    }
}
