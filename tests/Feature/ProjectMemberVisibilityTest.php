<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Models\User;
use App\Support\ProjectRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Everyone in a project sees the project's records, whoever added them;
 * owners, managers and editors change them; viewers only read.
 */
class ProjectMemberVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Project $project;

    private Expense $expense;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->owner->id, 'name' => 'Kitengela site']);
        $this->expense = Expense::factory()->create(['user_id' => $this->owner->id, 'project_id' => $this->project->id]);
    }

    private function member(string $role): User
    {
        $user = User::factory()->create(['role' => 'client']);
        $this->project->users()->attach($user->id, ['role' => $role, 'accepted_at' => now()]);

        return $user;
    }

    public function test_members_see_the_projects_records_in_their_lists(): void
    {
        $viewer = $this->member(ProjectRole::VIEWER);
        $photo = Photo::factory()->create(['user_id' => $this->owner->id, 'project_id' => $this->project->id]);
        ProjectTimeline::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($viewer)->get('/expenses')
            ->assertInertia(fn (Assert $page) => $page
                ->has('expenses', 1)
                ->where('expenses.0.id', $this->expense->id)
                ->where('projects.0', ['id' => $this->project->id, 'name' => 'Kitengela site', 'role' => 'viewer']));

        $this->actingAs($viewer)->get('/photos')
            ->assertInertia(fn (Assert $page) => $page->has('photos', 1)->where('photos.0.id', $photo->id));

        $this->actingAs($viewer)->get('/timeline')
            ->assertInertia(fn (Assert $page) => $page->has('timelines', 1)->has('expenses', 1));

        $this->actingAs($viewer)->get('/overview')
            ->assertInertia(fn (Assert $page) => $page
                ->has('projects', 1)
                ->where('projects.0.id', $this->project->id)
                ->where('projects.0.my_role', 'viewer'));
    }

    public function test_people_outside_the_project_see_none_of_it(): void
    {
        $outsider = User::factory()->create(['role' => 'client']);

        $this->actingAs($outsider)->get('/expenses')
            ->assertInertia(fn (Assert $page) => $page->has('expenses', 0)->has('projects', 0));
        $this->actingAs($outsider)->get("/expenses/{$this->expense->id}")->assertForbidden();
    }

    public function test_a_viewer_reads_but_cannot_change_records(): void
    {
        $viewer = $this->member(ProjectRole::VIEWER);

        $this->actingAs($viewer)->get("/expenses/{$this->expense->id}")->assertOk();
        $this->actingAs($viewer)->patch("/expenses/{$this->expense->id}", ['title' => 'Changed'])->assertForbidden();
        $this->actingAs($viewer)->delete("/expenses/{$this->expense->id}")->assertForbidden();
        $this->assertNotSame('Changed', $this->expense->fresh()->title);
    }

    public function test_an_editor_changes_records_others_added(): void
    {
        $editor = $this->member(ProjectRole::EDITOR);

        $this->actingAs($editor)->patch("/expenses/{$this->expense->id}", ['title' => 'Cement, 40 bags']);

        $this->assertSame('Cement, 40 bags', $this->expense->fresh()->title);
    }

    public function test_a_record_moves_only_to_a_project_you_can_edit(): void
    {
        $stranger = Project::factory()->create();
        $viewing = Project::factory()->create();
        $viewing->users()->attach($this->owner->id, ['role' => ProjectRole::VIEWER, 'accepted_at' => now()]);
        $mine = Project::factory()->create(['client_id' => $this->owner->id]);

        $this->actingAs($this->owner)->patch("/expenses/{$this->expense->id}", ['project_id' => $stranger->id])->assertForbidden();
        $this->actingAs($this->owner)->patch("/expenses/{$this->expense->id}", ['project_id' => $viewing->id])->assertForbidden();
        $this->assertSame($this->project->id, $this->expense->fresh()->project_id);

        $this->actingAs($this->owner)->patch("/expenses/{$this->expense->id}", ['project_id' => $mine->id]);
        $this->assertSame($mine->id, $this->expense->fresh()->project_id);
    }

    public function test_a_photo_moves_only_to_a_project_you_can_edit(): void
    {
        $photo = Photo::factory()->create(['user_id' => $this->owner->id, 'project_id' => $this->project->id]);
        $stranger = Project::factory()->create();

        $this->actingAs($this->owner)->patch("/photos/{$photo->id}", ['project_id' => $stranger->id])->assertForbidden();
        $this->assertSame($this->project->id, $photo->fresh()->project_id);
    }
}
