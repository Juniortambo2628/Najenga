<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Project;
use App\Models\ProjectTimeline;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Detail pages are told whether to offer Edit, as the photo and document pages are. */
class DetailPagePermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_expense_and_milestone_pages_offer_edit_to_editors_only(): void
    {
        $owner = User::factory()->create(['role' => 'client']);
        $viewer = User::factory()->create(['role' => 'client']);
        $project = Project::factory()->create(['client_id' => $owner->id]);
        $project->users()->attach($viewer->id, ['role' => 'viewer', 'accepted_at' => now()]);
        $expense = Expense::factory()->create(['user_id' => $owner->id, 'project_id' => $project->id]);
        $milestone = ProjectTimeline::factory()->create(['project_id' => $project->id]);

        $this->actingAs($owner)->get("/expenses/{$expense->id}")
            ->assertInertia(fn ($page) => $page->component('Expenses/Show')->where('can.update', true));
        $this->actingAs($viewer)->get("/expenses/{$expense->id}")
            ->assertInertia(fn ($page) => $page->where('can.update', false));

        $this->actingAs($owner)->get("/timeline/{$milestone->id}")
            ->assertInertia(fn ($page) => $page->component('Timeline/Show')->where('can.update', true));
        $this->actingAs($viewer)->get("/timeline/{$milestone->id}")
            ->assertInertia(fn ($page) => $page->where('can.update', false));
    }

    public function test_the_expense_page_says_how_its_receipt_was_checked(): void
    {
        $owner = User::factory()->create(['role' => 'client']);
        $expense = Expense::factory()->create(['user_id' => $owner->id]);
        \App\Models\Receipt::factory()->create(['expense_id' => $expense->id, 'verification_status' => 'verified']);

        $this->actingAs($owner)->get("/expenses/{$expense->id}")
            ->assertInertia(fn ($page) => $page->where('expense.receipt.verification_status', 'verified'));
    }

    public function test_the_user_page_offers_edit_to_admins(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create(['role' => 'client']);

        $this->actingAs($admin)->get("/users/{$member->id}")
            ->assertInertia(fn ($page) => $page->component('Users/Show')->where('can.update', true));
    }
}
