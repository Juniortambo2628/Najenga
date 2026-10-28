<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Receipt;
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

    public function test_a_receipt_uploaded_on_the_expense_is_listed_under_receipts(): void
    {
        $this->actingAs($this->user)
            ->postJson("/expenses/{$this->expense->id}/receipt", [
                'receipt' => UploadedFile::fake()->image('till slip.jpg', 200, 200),
            ])
            ->assertOk();

        $receipt = $this->expense->receipt()->first();
        $this->assertNotNull($receipt);
        $this->assertSame('till slip.jpg', $receipt->original_name);
        $this->assertSame('pending', $receipt->verification_status);

        $this->actingAs($this->user)
            ->get('/receipts')
            ->assertInertia(fn ($page) => $page->has('receipts', 1)->where('receipts.0.id', $receipt->id));

        // Replacing the file keeps the one row.
        $this->actingAs($this->user)
            ->postJson("/expenses/{$this->expense->id}/receipt", [
                'receipt' => UploadedFile::fake()->image('clearer.jpg', 200, 200),
            ])
            ->assertOk();
        $this->assertSame(1, Receipt::count());
        $this->assertSame('clearer.jpg', $receipt->fresh()->original_name);
    }

    public function test_removing_the_receipt_takes_it_off_the_receipts_list(): void
    {
        $this->actingAs($this->user)->postJson("/expenses/{$this->expense->id}/receipt", [
            'receipt' => UploadedFile::fake()->image('receipt.jpg', 200, 200),
        ]);

        $this->actingAs($this->user)->deleteJson("/expenses/{$this->expense->id}/receipt")->assertOk();

        $this->assertSame(0, Receipt::count());
    }

    public function test_receipts_already_on_expenses_are_backfilled_into_the_list(): void
    {
        $listed = Expense::factory()->create(['user_id' => $this->user->id]);
        $deleted = Expense::factory()->create(['user_id' => $this->user->id]);
        foreach ([$this->expense, $listed, $deleted] as $expense) {
            $expense->addMedia(UploadedFile::fake()->image("r{$expense->id}.jpg"))->toMediaCollection('receipt');
        }
        app(\App\Services\ReceiptProcessingService::class)->recordReceipt($listed);
        app(\App\Services\ReceiptProcessingService::class)->recordReceipt($deleted)->delete();
        Expense::factory()->create(['user_id' => $this->user->id]); // no receipt at all

        (require database_path('migrations/2026_10_28_000004_backfill_receipts_from_expense_media.php'))->up();

        $this->assertSame(1, $this->expense->receipt()->count());
        $this->assertSame(1, $listed->receipt()->count());
        $this->assertSame(0, $deleted->receipt()->count());
        $this->assertSame(3, Receipt::withTrashed()->count());
    }
}
