<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExpenseReceiptTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Expense $expense;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->user = User::factory()->create(['role' => 'client']);
        $this->expense = Expense::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_user_can_upload_receipt_to_expense(): void
    {
        $file = UploadedFile::fake()->image('receipt.jpg', 200, 200);

        $this->actingAs($this->user)
            ->postJson("/expenses/{$this->expense->id}/receipt", [
                'receipt' => $file,
            ])
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_user_cannot_upload_invalid_file_type(): void
    {
        $file = UploadedFile::fake()->create('receipt.exe', 100, 'application/x-executable');

        $this->actingAs($this->user)
            ->postJson("/expenses/{$this->expense->id}/receipt", [
                'receipt' => $file,
            ])
            ->assertStatus(422);
    }

    public function test_user_cannot_upload_receipt_to_other_users_expense(): void
    {
        $other = User::factory()->create();
        $otherExpense = Expense::factory()->create(['user_id' => $other->id]);
        $file = UploadedFile::fake()->image('receipt.jpg', 200, 200);

        $this->actingAs($this->user)
            ->postJson("/expenses/{$otherExpense->id}/receipt", [
                'receipt' => $file,
            ])
            ->assertForbidden();
    }

    public function test_user_can_remove_receipt_from_expense(): void
    {
        $this->actingAs($this->user)
            ->deleteJson("/expenses/{$this->expense->id}/receipt")
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_user_cannot_remove_receipt_from_other_users_expense(): void
    {
        $other = User::factory()->create();
        $otherExpense = Expense::factory()->create(['user_id' => $other->id]);

        $this->actingAs($this->user)
            ->deleteJson("/expenses/{$otherExpense->id}/receipt")
            ->assertForbidden();
    }
}
