<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Expense;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ActivityLoggerTest extends TestCase
{
    use RefreshDatabase;

    public function test_signing_in_writes_a_row(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect();

        $log = ActivityLog::orderByDesc('id')->first();

        $this->assertNotNull($log);
        $this->assertSame('auth.login', $log->action);
        $this->assertSame($user->id, $log->user_id);
        $this->assertSame('Signed in', $log->description);
        $this->assertNotNull($log->ip_address);
    }

    public function test_failed_sign_in_is_recorded_without_a_user(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $log = ActivityLog::orderByDesc('id')->first();

        $this->assertNotNull($log);
        $this->assertSame('auth.failed', $log->action);
        $this->assertNull($log->user_id, 'a rejected sign-in must not be blamed on a session');
        $this->assertStringContainsString($user->email, $log->description);
    }

    public function test_signing_out_writes_a_row(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/logout');

        $log = ActivityLog::orderByDesc('id')->first();

        $this->assertSame('auth.logout', $log->action);
        $this->assertSame($user->id, $log->user_id);
    }

    public function test_creating_a_project_writes_a_row(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user)->post('/projects', [
            'name' => 'Audit Trail',
            'status' => 'active',
        ])->assertRedirect();

        $log = ActivityLog::orderByDesc('id')->first();

        $this->assertSame('project.created', $log->action);
        $this->assertSame($user->id, $log->user_id);
        $this->assertStringContainsString('Audit Trail', $log->description);
    }

    public function test_deleting_an_expense_writes_a_row(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $expense = Expense::factory()->create(['user_id' => $user->id, 'title' => 'Scaffolding hire']);

        $this->actingAs($user)->delete("/expenses/{$expense->id}");

        $log = ActivityLog::orderByDesc('id')->first();

        $this->assertSame('expense.deleted', $log->action);
        $this->assertSame($user->id, $log->user_id);
        $this->assertStringContainsString('Scaffolding hire', $log->description);
    }

    public function test_the_activity_page_only_shows_my_own_rows(): void
    {
        $me = User::factory()->create(['role' => 'client']);
        $other = User::factory()->create(['role' => 'client']);

        ActivityLogger::logFor($me, 'project.created', 'mine');
        ActivityLogger::logFor($other, 'project.created', 'theirs');

        $this->actingAs($me)
            ->get('/activity-logs')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('ActivityLogs')
                ->has('logs.data', 1)
                ->where('logs.data.0.description', 'mine'));
    }

    public function test_the_same_controller_serves_the_page_and_the_json_endpoint(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        ActivityLogger::logFor($user, 'project.created', 'one row');

        // The Inertia page, no Accept header.
        $this->actingAs($user)
            ->get('/activity-logs')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('ActivityLogs')
                ->has('logs.data', 1));

        // The expense modal's fetch, which axios sends as Accept: application/json.
        $this->actingAs($user)
            ->getJson('/api/activity-logs')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'action', 'description', 'ip_address']],
            ])
            ->assertJsonPath('data.0.action', 'project.created');
    }

    public function test_action_code_is_capped_at_the_column_width(): void
    {
        $user = User::factory()->create();

        ActivityLogger::logFor($user, str_repeat('a', 300), 'overlong');

        $log = ActivityLog::orderByDesc('id')->first();

        $this->assertSame(100, mb_strlen($log->action), 'action is a varchar(100)');
    }
}
