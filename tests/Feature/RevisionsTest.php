<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Models\Receipt;
use App\Models\Revision;
use App\Models\User;
use Illuminate\Database\Events\MigrationsEnded;
use Illuminate\Database\Events\MigrationsStarted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RevisionsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        // Enforce foreign keys as MySQL does (the SQLite test database runs without them).
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON');
        }

        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        $this->project = Project::factory()->create(['client_id' => $this->user->id]);
    }

    public function test_create_update_and_delete_each_record_a_version(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id, 'project_id' => $this->project->id, 'title' => 'Cement']);
        $expense->update(['title' => 'Cement, 40 bags']);
        $expenseId = $expense->id;
        $expense->delete();

        $versions = Revision::where('revisionable_type', $expense->getMorphClass())->where('revisionable_id', $expenseId)->orderBy('id')->get();

        $this->assertSame(['created', 'updated', 'deleted'], $versions->pluck('event')->all());
        $this->assertSame($this->project->id, $versions[0]->project_id);
        $this->assertSame($this->user->id, $versions[0]->user_id);
        $this->assertNull($versions[0]->before);
        $this->assertSame('Cement', $versions[1]->before['title']);
        $this->assertSame('Cement, 40 bags', $versions[1]->after['title']);
        $this->assertSame(['title'], $versions[1]->changed);
        $this->assertSame([['field' => 'title', 'before' => 'Cement', 'after' => 'Cement, 40 bags']], $versions[1]->diff());
        $this->assertSame('Cement, 40 bags', $versions[2]->before['title']);
        $this->assertNull($versions[2]->after);
    }

    public function test_quick_edits_by_one_person_merge_into_one_version(): void
    {
        $milestone = ProjectTimeline::factory()->create(['project_id' => $this->project->id, 'title' => 'Foundation', 'status' => 'pending', 'priority' => 'low']);
        $milestone->update(['title' => 'Foundation slab']);
        $this->travel(5)->minutes();
        $milestone->update(['status' => 'in_progress']);

        $updates = $milestone->revisions()->where('event', 'updated')->get();
        $this->assertCount(1, $updates);
        $this->assertSame('Foundation', $updates[0]->before['title']);
        $this->assertSame('in_progress', $updates[0]->after['status']);
        $this->assertEqualsCanonicalizing(['title', 'status'], $updates[0]->changed);

        // Later, or by someone else: a new version.
        $this->travel(11)->minutes();
        $milestone->update(['status' => 'completed']);
        $this->actingAs(User::factory()->create());
        $milestone->update(['priority' => 'critical']);

        $this->assertSame(3, $milestone->revisions()->where('event', 'updated')->count());
    }

    public function test_timestamps_alone_are_not_a_version(): void
    {
        $photo = Photo::factory()->create(['user_id' => $this->user->id, 'project_id' => $this->project->id]);
        $this->travel(1)->minutes();
        $photo->touch();

        $this->assertSame(['created'], $photo->revisions()->pluck('event')->all());
    }

    public function test_every_versioned_record_files_under_its_project(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id, 'project_id' => $this->project->id]);
        $records = [
            $this->project,
            $expense,
            Receipt::factory()->create(['expense_id' => $expense->id]),
            Document::factory()->create(['user_id' => $this->user->id, 'project_id' => $this->project->id]),
            Photo::factory()->create(['user_id' => $this->user->id, 'project_id' => $this->project->id]),
            ProjectTimeline::factory()->create(['project_id' => $this->project->id]),
        ];

        foreach ($records as $record) {
            $this->assertSame($this->project->id, $record->revisions()->value('project_id'), class_basename($record));
        }
    }

    public function test_deleting_a_project_keeps_its_last_version(): void
    {
        $id = $this->project->id;
        $this->project->delete();

        $deleted = Revision::where('revisionable_type', $this->project->getMorphClass())
            ->where('revisionable_id', $id)->where('event', 'deleted')->sole();
        $this->assertSame($id, $deleted->project_id); // in the trash: still the project's history
        $this->assertSame($this->project->name, $deleted->before['name']);

        // Deleted for good, the row is gone and can't be referenced (MySQL's foreign key).
        $this->project->forceDelete();
        $this->assertNull(Revision::where('revisionable_id', $id)->where('revisionable_type', $this->project->getMorphClass())->latest('id')->value('project_id'));
    }

    public function test_versions_older_than_180_days_are_pruned(): void
    {
        $milestone = ProjectTimeline::factory()->create(['project_id' => $this->project->id]);
        $this->travel(Revision::KEEP_DAYS + 1)->days();
        $milestone->update(['title' => 'Roofing']);

        $this->artisan('model:prune', ['--model' => [Revision::class]])->assertSuccessful();

        $this->assertSame(['updated'], $milestone->revisions()->pluck('event')->all());
    }

    public function test_paused_while_migrations_run(): void
    {
        event(new MigrationsStarted('up'));
        ProjectTimeline::factory()->create(['project_id' => $this->project->id]);
        event(new MigrationsEnded('up'));
        $this->assertSame(0, Revision::where('revisionable_type', (new ProjectTimeline)->getMorphClass())->count());

        ProjectTimeline::factory()->create(['project_id' => $this->project->id]);
        $this->assertSame(1, Revision::where('revisionable_type', (new ProjectTimeline)->getMorphClass())->count());
    }
}
