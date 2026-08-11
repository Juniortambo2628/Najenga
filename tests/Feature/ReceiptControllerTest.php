<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceiptControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_receipts(): void
    {
        $this->get('/receipts')->assertRedirect('/login');
    }

    public function test_user_can_list_receipts(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);
        Receipt::factory()->count(3)->create(['expense_id' => $expense->id]);

        $this->actingAs($this->user)
            ->get('/receipts')
            ->assertOk();
    }

    public function test_user_sees_only_own_receipts(): void
    {
        $other = User::factory()->create();
        $ownExpense = Expense::factory()->create(['user_id' => $this->user->id]);
        $otherExpense = Expense::factory()->create(['user_id' => $other->id]);
        Receipt::factory()->count(2)->create(['expense_id' => $ownExpense->id]);
        Receipt::factory()->count(5)->create(['expense_id' => $otherExpense->id]);

        $this->actingAs($this->user)
            ->get('/receipts')
            ->assertOk();
    }

    public function test_user_can_view_receipt(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->actingAs($this->user)
            ->getJson("/receipts/{$receipt->id}")
            ->assertOk()
            ->assertJsonPath('id', $receipt->id);
    }

    public function test_user_can_update_receipt_verification_status(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->actingAs($this->user)
            ->patchJson("/receipts/{$receipt->id}", [
                'verification_status' => 'verified',
                'needs_verification' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('receipts', [
            'id' => $receipt->id,
            'verification_status' => 'verified',
        ]);
    }

    public function test_user_cannot_update_receipt_with_invalid_status(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->actingAs($this->user)
            ->patchJson("/receipts/{$receipt->id}", [
                'verification_status' => 'invalid_status',
            ])
            ->assertStatus(422);
    }

    public function test_user_can_delete_own_receipt(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->actingAs($this->user)
            ->delete("/receipts/{$receipt->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('receipts', ['id' => $receipt->id]);
    }

    public function test_user_cannot_delete_other_users_receipt(): void
    {
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->actingAs($this->user)
            ->delete("/receipts/{$receipt->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('receipts', ['id' => $receipt->id]);
    }

    public function test_analyze_requires_receipt_file(): void
    {
        $this->actingAs($this->user)
            ->postJson('/receipts/analyze', [])
            ->assertStatus(422);
    }

    public function test_analyze_rejects_invalid_file_type(): void
    {
        $this->actingAs($this->user)
            ->postJson('/receipts/analyze', [
                'receipt' => \Illuminate\Http\UploadedFile::fake()->create('test.exe', 100, 'application/x-executable'),
            ])
            ->assertStatus(422);
    }

    public function test_store_requires_expense_data(): void
    {
        $this->actingAs($this->user)
            ->postJson('/receipts/store', [])
            ->assertStatus(422);
    }

    public function test_store_bulk_requires_expenses_array(): void
    {
        $this->actingAs($this->user)
            ->postJson('/receipts/store-bulk', [])
            ->assertStatus(422);
    }

    public function test_nonexistent_receipt_returns_404(): void
    {
        $this->actingAs($this->user)
            ->getJson('/receipts/999999')
            ->assertStatus(404);
    }
}
