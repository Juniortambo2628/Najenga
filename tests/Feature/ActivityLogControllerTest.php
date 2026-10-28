<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Expense;
use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ActivityLogControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_activity_logs(): void
    {
        $this->get('/activity-logs')->assertRedirect('/login');
    }

    public function test_user_can_access_activity_logs(): void
    {
        ActivityLog::factory()->count(5)->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->get('/activity-logs')
            ->assertOk();
    }

    public function test_user_only_sees_own_activity_logs(): void
    {
        $other = User::factory()->create();
        ActivityLog::factory()->count(3)->create(['user_id' => $this->user->id]);
        ActivityLog::factory()->count(7)->create(['user_id' => $other->id]);

        $this->actingAs($this->user)
            ->get('/activity-logs')
            ->assertOk();
    }

    public function test_the_page_shows_record_changes_from_the_history_and_other_activity_from_the_log(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);
        $member = User::factory()->create();
        $project->users()->attach($member->id, ['role' => 'editor', 'accepted_at' => now()]);

        $this->actingAs($member);
        $expense = Expense::factory()->create(['user_id' => $member->id, 'project_id' => $project->id, 'title' => 'Cement']);
        ActivityLogger::logFor($this->user, 'expense.created', 'Created expense Cement');
        ActivityLogger::logFor($this->user, 'auth.login', 'Signed in');

        $this->actingAs($this->user)
            ->get('/activity-logs')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('ActivityLogs')
                ->where('tab', 'changes')
                // A member's change shows to the project's owner.
                ->where('changes.data.0.label', 'Cement')
                ->where('changes.data.0.user.id', $member->id)
                // The log keeps sign-ins, without rows the history already has.
                ->has('logs.data', 1)
                ->where('logs.data.0.action', 'auth.login'));

        $this->actingAs(User::factory()->create())
            ->get('/activity-logs?tab=account')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('tab', 'account')
                ->has('changes.data', 0));
    }
}
