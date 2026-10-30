<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_home_is_redirected_to_dashboard(): void
    {
        // Phase 2.7H merged /home into /dashboard; bookmarks must not 404.
        $this->get('/home')
            ->assertStatus(301)
            ->assertRedirect('/dashboard');
    }
    public function test_user_can_access_dashboard(): void
    {
        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_dashboard_shows_user_stats(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id, 'status' => 'active']);
        Expense::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => 10000,
        ]);
        Photo::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
        ]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_dashboard_does_not_include_other_users_data(): void
    {
        $otherUser = User::factory()->create(['role' => 'client']);
        $otherProject = Project::factory()->create(['client_id' => $otherUser->id]);
        Expense::factory()->count(5)->create([
            'user_id' => $otherUser->id,
            'project_id' => $otherProject->id,
            'amount' => 50000,
        ]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk();
    }

    public function test_dashboard_recent_projects_are_scoped_to_the_signed_in_client(): void
    {
        Project::factory()->count(2)->create(['client_id' => $this->user->id]);
        $otherUser = User::factory()->create(['role' => 'client']);
        Project::factory()->count(5)->create(['client_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('recentProjects', 2)
                ->where('stats.totalProjects', 2));
    }

    public function test_expense_trend_compares_this_month_with_the_previous_month(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => 1500,
            'expense_date' => now()->startOfMonth()->toDateString(),
        ]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => 1000,
            'expense_date' => now()->subMonthNoOverflow()->toDateString(),
        ]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.expenseTrend', 50));
    }

    public function test_expense_trend_is_zero_without_previous_month_spend(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => 5000,
            'expense_date' => now()->startOfMonth()->toDateString(),
        ]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.expenseTrend', 0));
    }

    public function test_expense_trend_ignores_older_months_and_other_users(): void
    {
        $project = Project::factory()->create(['client_id' => $this->user->id]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => 1500,
            'expense_date' => now()->startOfMonth()->toDateString(),
        ]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => 1000,
            'expense_date' => now()->subMonthNoOverflow()->toDateString(),
        ]);
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => 999999,
            'expense_date' => now()->subMonthsNoOverflow(3)->toDateString(),
        ]);

        $otherUser = User::factory()->create(['role' => 'client']);
        $otherProject = Project::factory()->create(['client_id' => $otherUser->id]);
        Expense::factory()->create([
            'user_id' => $otherUser->id,
            'project_id' => $otherProject->id,
            'amount' => 999999,
            'expense_date' => now()->subMonthNoOverflow()->toDateString(),
        ]);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.expenseTrend', 50));
    }

    public static function monthEndDates(): array
    {
        return [
            '30 October (previous month ends on the 30th)' => ['2026-10-30', '2026-09-30', '2026-08-31'],
            '31 October' => ['2026-10-31', '2026-09-30', '2026-08-31'],
            '31 March (subMonth would overflow into March)' => ['2026-03-31', '2026-02-28', '2026-01-31'],
            '29 February in a leap year' => ['2028-02-29', '2028-01-31', '2027-12-31'],
            '1 March' => ['2026-03-01', '2026-02-28', '2026-01-31'],
        ];
    }

    #[DataProvider('monthEndDates')]
    public function test_expense_trend_uses_whole_calendar_months_near_month_end(
        string $today,
        string $lastDayOfPreviousMonth,
        string $lastDayOfMonthBefore,
    ): void {
        $this->travelTo($today.' 12:00:00');

        $project = Project::factory()->create(['client_id' => $this->user->id]);
        $expense = fn (int $amount, string $date) => Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
            'amount' => $amount,
            'expense_date' => $date,
        ]);

        // This month: 1500, spent on today's date (the last day for most cases).
        $expense(1500, $today);
        // Previous month: 1000, on its first and last days.
        $expense(400, substr($lastDayOfPreviousMonth, 0, 8).'01');
        $expense(600, $lastDayOfPreviousMonth);
        // The month before must not count as "previous".
        $expense(999999, $lastDayOfMonthBefore);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.expenseTrend', 50));
    }
}
