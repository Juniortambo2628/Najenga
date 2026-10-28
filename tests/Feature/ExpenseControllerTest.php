<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $this->otherUser = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->user->id]);
    }

    public function test_unauthenticated_user_cannot_access_expenses(): void
    {
        $this->get('/expenses')->assertRedirect('/login');
    }

    public function test_user_can_view_expenses_index(): void
    {
        Expense::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->get('/expenses')
            ->assertOk();
    }

    public function test_user_sees_only_own_expenses(): void
    {
        Expense::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);
        Expense::factory()->count(5)->create([
            'user_id' => $this->otherUser->id,
            'project_id' => $this->project->id,
        ]);

        $response = $this->actingAs($this->user)->get('/expenses');
        $response->assertOk();
    }

    public function test_user_can_create_expense(): void
    {
        $this->actingAs($this->user)
            ->post('/expenses', [
                'title' => 'Office Supplies',
                'amount' => 15000,
                'category' => 'office',
                'project_id' => $this->project->id,
                'expense_date' => '2026-08-01',
                'description' => 'Purchased office supplies',
                'payment_method' => 'cash',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'title' => 'Office Supplies',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_user_cannot_create_expense_without_title(): void
    {
        $this->actingAs($this->user)
            ->post('/expenses', [
                'amount' => 15000,
                'category' => 'office',
                'expense_date' => '2026-08-01',
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('expenses', [
            'amount' => 15000,
        ]);
    }

    public function test_user_cannot_create_expense_without_amount(): void
    {
        $this->actingAs($this->user)
            ->post('/expenses', [
                'title' => 'Test',
                'category' => 'office',
                'expense_date' => '2026-08-01',
            ])
            ->assertRedirect();
    }

    public function test_user_can_update_own_expense(): void
    {
        $expense = Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/expenses/{$expense->id}", [
                'title' => 'Updated Expense',
                'amount' => 25000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('expenses', [
            'id' => $expense->id,
            'title' => 'Updated Expense',
        ]);
    }

    public function test_user_cannot_update_other_users_expense(): void
    {
        $expense = Expense::factory()->create([
            'user_id' => $this->otherUser->id,
            'project_id' => Project::factory()->create(['client_id' => $this->otherUser->id])->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/expenses/{$expense->id}", ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_expense(): void
    {
        $expense = Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/expenses/{$expense->id}")
            ->assertRedirect();

        $this->assertSoftDeleted('expenses', ['id' => $expense->id]);
    }

    public function test_user_cannot_delete_other_users_expense(): void
    {
        $expense = Expense::factory()->create([
            'user_id' => $this->otherUser->id,
            'project_id' => Project::factory()->create(['client_id' => $this->otherUser->id])->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/expenses/{$expense->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('expenses', ['id' => $expense->id]);
    }

    public function test_user_can_batch_store_expenses(): void
    {
        $this->actingAs($this->user)
            ->post('/expenses/batch', [
                'expenses' => [
                    [
                        'title' => 'Batch Expense 1',
                        'amount' => 5000,
                        'category' => 'materials',
                        'expense_date' => '2026-08-01',
                    ],
                    [
                        'title' => 'Batch Expense 2',
                        'amount' => 10000,
                        'category' => 'labor',
                        'expense_date' => '2026-08-02',
                    ],
                ],
            ])
            ->assertOk()
            ->assertJson(['saved_count' => 2, 'error_count' => 0]);

        $this->assertDatabaseHas('expenses', ['title' => 'Batch Expense 1', 'user_id' => $this->user->id]);
        $this->assertDatabaseHas('expenses', ['title' => 'Batch Expense 2', 'user_id' => $this->user->id]);
    }

    public function test_batch_store_accepts_confirmed_status_and_ocr_fields(): void
    {
        $this->actingAs($this->user)
            ->post('/expenses/batch', [
                'expenses' => [
                    [
                        'title' => 'Confirmed OCR row',
                        'amount' => 250,
                        'category' => 'materials',
                        'expense_date' => '2026-08-03',
                        'status' => 'confirmed',
                        'payment_source' => 'ocr',
                        'confidence' => 0.912,
                        'source_channel' => 'whatsapp',
                    ],
                ],
            ])
            ->assertOk()
            ->assertJson(['saved_count' => 1, 'error_count' => 0]);

        $expense = Expense::query()->where('title', 'Confirmed OCR row')->firstOrFail();

        $this->assertSame('confirmed', $expense->status);
        $this->assertSame('ocr', $expense->payment_source);
        $this->assertSame('whatsapp', $expense->source_channel);
        $this->assertSame(0.912, (float) $expense->confidence);
    }

    public function test_batch_store_still_rejects_unknown_status(): void
    {
        $this->actingAs($this->user)
            ->postJson('/expenses/batch', [
                'expenses' => [
                    [
                        'title' => 'Bogus status row',
                        'amount' => 100,
                        'category' => 'materials',
                        'expense_date' => '2026-08-03',
                        'status' => 'bogus',
                    ],
                ],
            ])
            ->assertJsonValidationErrors(['expenses.0.status']);
    }

    public function test_user_can_view_expense(): void
    {
        $expense = Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->get("/expenses/{$expense->id}")
            ->assertOk();
    }

    public function test_user_cannot_view_other_users_expense(): void
    {
        $expense = Expense::factory()->create([
            'user_id' => $this->otherUser->id,
            'project_id' => Project::factory()->create(['client_id' => $this->otherUser->id])->id,
        ]);

        $this->actingAs($this->user)
            ->get("/expenses/{$expense->id}")
            ->assertForbidden();
    }

    public function test_expense_belongs_to_correct_user(): void
    {
        $expense = Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->get('/expenses')
            ->assertOk();
    }

    public function test_user_can_batch_assign_expenses_to_project(): void
    {
        $target = Project::factory()->create(['client_id' => $this->user->id]);
        $expenses = Expense::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'project_id' => null,
        ]);

        $this->actingAs($this->user)
            ->patchJson('/expenses/batch/project', [
                'ids' => $expenses->pluck('id')->all(),
                'project_id' => $target->id,
            ])
            ->assertOk()
            ->assertJson(['updated' => 3]);

        foreach ($expenses as $expense) {
            $this->assertEquals($target->id, $expense->fresh()->project_id);
        }
    }

    public function test_user_can_remove_project_from_batch_of_expenses(): void
    {
        $expenses = Expense::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->patchJson('/expenses/batch/project', [
                'ids' => $expenses->pluck('id')->all(),
                'project_id' => null,
            ])
            ->assertOk()
            ->assertJson(['updated' => 2]);

        foreach ($expenses as $expense) {
            $this->assertNull($expense->fresh()->project_id);
        }
    }

    public function test_batch_assign_does_not_touch_other_users_expenses(): void
    {
        $target = Project::factory()->create(['client_id' => $this->user->id]);
        $own = Expense::factory()->create(['user_id' => $this->user->id, 'project_id' => null]);
        $other = Expense::factory()->create(['user_id' => $this->otherUser->id, 'project_id' => null]);

        $this->actingAs($this->user)
            ->patchJson('/expenses/batch/project', [
                'ids' => [$own->id, $other->id],
                'project_id' => $target->id,
            ])
            ->assertOk()
            ->assertJson(['updated' => 1]);

        $this->assertEquals($target->id, $own->fresh()->project_id);
        $this->assertNull($other->fresh()->project_id);
    }

    public function test_batch_assign_rejects_unknown_project(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id, 'project_id' => null]);

        $this->actingAs($this->user)
            ->patchJson('/expenses/batch/project', [
                'ids' => [$expense->id],
                'project_id' => 999999,
            ])
            ->assertUnprocessable();

        $this->assertNull($expense->fresh()->project_id);
    }

    public function test_unauthenticated_user_cannot_batch_assign(): void
    {
        $this->patchJson('/expenses/batch/project', [
            'ids' => [1],
            'project_id' => null,
        ])->assertUnauthorized();
    }
}
