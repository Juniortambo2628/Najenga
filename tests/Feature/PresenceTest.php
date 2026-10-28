<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PresenceTest extends TestCase
{
    use RefreshDatabase;

    private User $me;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->me = User::factory()->create(['first_name' => 'Olive']);
        $this->project = Project::factory()->create(['client_id' => $this->me->id]);
    }

    private function online(User $user, string $page): void
    {
        $this->actingAs($user)->postJson('/presence/heartbeat', ['page' => $page])->assertOk();
    }

    public function test_the_heartbeat_stamps_when_and_where_without_the_query(): void
    {
        $this->online($this->me, '/expenses?search=cement');

        $this->me->refresh();
        $this->assertSame('/expenses', $this->me->current_page);
        $this->assertTrue($this->me->seen_at->isToday());
    }

    public function test_it_lists_collaborators_online_and_where_they_are(): void
    {
        $member = User::factory()->create(['first_name' => 'Mary']);
        $this->project->users()->attach($member->id, ['role' => 'editor', 'accepted_at' => now()]);
        $stranger = User::factory()->create();

        $this->online($member, "/projects/{$this->project->id}");
        $this->online($stranger, '/photos');

        $this->actingAs($this->me)->postJson('/presence/heartbeat', ['page' => '/expenses'])
            ->assertOk()
            ->assertJsonCount(1, 'online')
            ->assertJsonPath('online.0', ['id' => $member->id, 'name' => $member->name, 'projects' => [$this->project->id], 'page' => 'projects', 'project_id' => $this->project->id]);

        // The member sees the project's owner too (owners are members from 12.5's backfill on).
        $this->actingAs($member)->postJson('/presence/heartbeat', ['page' => '/photos'])
            ->assertJsonPath('online.0.id', $this->me->id)
            ->assertJsonPath('online.0.page', 'expenses');
    }

    public function test_people_seen_over_a_minute_ago_are_offline(): void
    {
        $member = User::factory()->create();
        $this->project->users()->attach($member->id, ['role' => 'viewer', 'accepted_at' => now()]);
        $this->online($member, '/photos');

        $this->travel(61)->seconds();

        $this->actingAs($this->me)->postJson('/presence/heartbeat', ['page' => '/'])->assertJsonCount(0, 'online');
    }

    public function test_a_project_the_viewer_cannot_see_is_not_named(): void
    {
        $member = User::factory()->create();
        $this->project->users()->attach($member->id, ['role' => 'editor', 'accepted_at' => now()]);
        $private = Project::factory()->create(['client_id' => $member->id]);
        $this->online($member, "/projects/{$private->id}/edit");

        $this->actingAs($this->me)->postJson('/presence/heartbeat', ['page' => '/'])
            ->assertJsonPath('online.0.page', 'projects')
            ->assertJsonPath('online.0.project_id', null);
    }

    public function test_guests_cannot_send_heartbeats(): void
    {
        $this->postJson('/presence/heartbeat', ['page' => '/'])->assertUnauthorized();
    }

    public function test_sidebar_badges_count_others_changes_since_you_last_opened_the_page(): void
    {
        $member = User::factory()->create();
        $this->project->users()->attach($member->id, ['role' => 'editor', 'accepted_at' => now()]);

        // I open Expenses, then a member adds two expenses and a photo.
        $this->online($this->me, '/expenses');
        $this->travel(1)->minutes();
        $this->actingAs($member);
        Expense::factory()->count(2)->create(['user_id' => $member->id, 'project_id' => $this->project->id]);
        Photo::factory()->create(['user_id' => $member->id, 'project_id' => $this->project->id]);
        // My own change doesn't count.
        $this->actingAs($this->me);
        Expense::factory()->create(['user_id' => $this->me->id, 'project_id' => $this->project->id]);

        $this->travel(1)->minutes();
        $this->actingAs($this->me)->postJson('/presence/heartbeat', ['page' => '/dashboard'])
            ->assertJsonPath('badges.expenses', 2)
            ->assertJsonPath('badges.photos', 1)
            ->assertJsonMissingPath('badges.documents');

        // Opening Expenses clears its badge.
        $this->actingAs($this->me)->postJson('/presence/heartbeat', ['page' => '/expenses'])
            ->assertJsonMissingPath('badges.expenses')
            ->assertJsonPath('badges.photos', 1);
    }

    public function test_changes_in_projects_you_cannot_see_never_count(): void
    {
        $stranger = User::factory()->create();
        $theirs = Project::factory()->create(['client_id' => $stranger->id]);
        $this->actingAs($stranger);
        Expense::factory()->create(['user_id' => $stranger->id, 'project_id' => $theirs->id]);

        $this->actingAs($this->me)->postJson('/presence/heartbeat', ['page' => '/'])
            ->assertJsonMissingPath('badges.expenses');
    }
}
