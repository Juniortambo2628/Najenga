<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Project;
use App\Models\Revision;
use App\Models\User;
use App\Support\ProjectRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HistoryControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Project $project;

    private Expense $expense;

    protected function setUp(): void
    {
        parent::setUp();
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON');
        }

        $this->owner = User::factory()->create();
        $this->project = Project::factory()->create(['client_id' => $this->owner->id, 'name' => 'Kitengela site']);
        $this->actingAs($this->owner);
        $this->expense = Expense::factory()->create([
            'user_id' => $this->owner->id, 'project_id' => $this->project->id, 'title' => 'Cement', 'amount' => 1000,
        ]);
        $this->travel(11)->minutes();
        $this->expense->update(['title' => 'Cement, 40 bags', 'amount' => 1200]);
    }

    private function member(string $role): User
    {
        $user = User::factory()->create();
        $this->project->users()->attach($user->id, ['role' => $role, 'accepted_at' => now()]);

        return $user;
    }

    public function test_a_records_versions_say_who_changed_what(): void
    {
        $this->getJson("/history/expense/{$this->expense->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.event', 'updated')
            ->assertJsonPath('data.0.label', 'Cement, 40 bags')
            ->assertJsonPath('data.0.user.name', $this->owner->name)
            ->assertJsonPath('data.0.changes.0', ['field' => 'title', 'before' => 'Cement', 'after' => 'Cement, 40 bags'])
            ->assertJsonPath('data.1.event', 'created');
    }

    public function test_a_page_and_a_project_list_the_versions_members_can_see(): void
    {
        $viewer = $this->member(ProjectRole::VIEWER);
        $elsewhere = Project::factory()->create();
        Expense::factory()->create(['project_id' => $elsewhere->id, 'user_id' => $elsewhere->client_id]);

        $this->actingAs($viewer)->getJson('/history?type=expense')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->actingAs($viewer)->getJson("/projects/{$this->project->id}/history")
            ->assertOk()
            ->assertJsonPath('data.0.type', 'expense');

        $this->actingAs($viewer)->getJson("/history?type=expense&project_id={$elsewhere->id}")->assertForbidden();
        $this->actingAs($viewer)->getJson("/projects/{$elsewhere->id}/history")->assertForbidden();
    }

    public function test_an_outsider_sees_nothing(): void
    {
        $outsider = User::factory()->create();

        $this->actingAs($outsider)->getJson("/history/expense/{$this->expense->id}")->assertForbidden();
        $this->actingAs($outsider)->getJson('/history?type=expense')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_restoring_an_earlier_version(): void
    {
        $created = $this->expense->revisions()->where('event', 'created')->sole();

        $this->postJson("/history/versions/{$created->id}/restore")
            ->assertOk()
            ->assertJsonPath('record', ['type' => 'expense', 'id' => $this->expense->id]);

        $this->expense->refresh();
        $this->assertSame('Cement', $this->expense->title);
        $this->assertEquals(1000, $this->expense->amount);
        $this->assertSame('restored', $this->expense->revisions()->value('event'));
    }

    public function test_a_trashed_record_comes_back_from_its_deletion(): void
    {
        $this->expense->delete();
        $deleted = $this->expense->revisions()->where('event', 'deleted')->sole();

        $this->getJson("/history/expense/{$this->expense->id}")->assertOk()->assertJsonPath('data.0.event', 'deleted');
        $this->postJson("/history/versions/{$deleted->id}/restore")->assertOk();

        $this->assertNotSoftDeleted('expenses', ['id' => $this->expense->id, 'title' => 'Cement, 40 bags']);
        $this->assertSame(1, $this->expense->revisions()->where('event', 'restored')->count());
    }

    public function test_a_record_deleted_for_good_is_recreated(): void
    {
        $id = $this->expense->id;
        $this->expense->forceDelete();
        $deleted = Revision::where('revisionable_id', $id)->where('event', 'deleted')->latest('id')->first();

        $this->postJson("/history/versions/{$deleted->id}/restore")->assertOk();

        $this->assertDatabaseHas('expenses', ['id' => $id, 'title' => 'Cement, 40 bags', 'deleted_at' => null]);
    }

    public function test_viewers_and_outsiders_cannot_restore(): void
    {
        $created = $this->expense->revisions()->where('event', 'created')->sole();

        $this->actingAs($this->member(ProjectRole::VIEWER))->postJson("/history/versions/{$created->id}/restore")->assertForbidden();
        $this->actingAs(User::factory()->create())->postJson("/history/versions/{$created->id}/restore")->assertForbidden();
        $this->assertSame('Cement, 40 bags', $this->expense->fresh()->title);

        $this->actingAs($this->member(ProjectRole::EDITOR))->postJson("/history/versions/{$created->id}/restore")->assertOk();
        $this->assertSame('Cement', $this->expense->fresh()->title);
    }

    public function test_a_deleted_project_comes_back_with_its_records(): void
    {
        $this->project->delete();
        $deleted = $this->project->revisions()->where('event', 'deleted')->sole();

        $this->postJson("/history/versions/{$deleted->id}/restore")->assertOk();

        $this->assertNotSoftDeleted('projects', ['id' => $this->project->id]);
        $this->assertNotSoftDeleted('expenses', ['id' => $this->expense->id]);
    }

    public function test_unknown_types_are_rejected(): void
    {
        $this->getJson('/history/user/1')->assertNotFound();
        $this->getJson('/history?type=user')->assertUnprocessable();
    }
}
