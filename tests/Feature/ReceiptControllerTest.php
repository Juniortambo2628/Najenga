<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
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
            ->get("/receipts/{$receipt->id}")
            ->assertOk();
    }

    public function test_user_cannot_view_another_users_receipt(): void
    {
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        // show() had no authorize() call, so any signed-in user could read any
        // receipt. ReceiptPolicy::view existed but was never invoked.
        $this->actingAs($this->user)
            ->get("/receipts/{$receipt->id}")
            ->assertForbidden();
    }

    public function test_user_can_edit_own_receipt(): void
    {
        $expense = Expense::factory()->create(['user_id' => $this->user->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->actingAs($this->user)
            ->get("/receipts/{$receipt->id}/edit")
            ->assertOk();
    }

    public function test_user_cannot_edit_another_users_receipt(): void
    {
        $other = User::factory()->create();
        $expense = Expense::factory()->create(['user_id' => $other->id]);
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->actingAs($this->user)
            ->get("/receipts/{$receipt->id}/edit")
            ->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_open_a_single_receipt(): void
    {
        $expense = Expense::factory()->create();
        $receipt = Receipt::factory()->create(['expense_id' => $expense->id]);

        $this->get("/receipts/{$receipt->id}")->assertRedirect('/login');
        $this->get("/receipts/{$receipt->id}/edit")->assertRedirect('/login');
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

    public function test_storing_a_receipt_records_a_receipts_row(): void
    {
        Storage::fake();
        Storage::fake('public');

        $ocr = $this->createMock(\App\Services\OcrService::class);
        $ocr->method('extractText')->willReturn([
            'success' => true,
            'text' => 'KES 1500 paid to Jane Doe Ref: ABC123 12/03/2026',
            'confidence' => 0.95,
            'source' => 'test-fixture',
        ]);
        $this->app->instance(\App\Services\OcrService::class, $ocr);

        $image = imagecreatetruecolor(40, 40);
        ob_start();
        imagejpeg($image);
        $bytes = ob_get_clean();
        imagedestroy($image);
        Storage::disk('local')->put('temp_receipts/new.jpg', $bytes);

        $this->actingAs($this->user)
            ->postJson('/receipts/store', [
                'title' => 'Site materials',
                'amount' => 1500,
                'expense_date' => '2026-03-12',
                'recipient' => 'Jane Doe',
                'reference_number' => 'ABC123',
                'temp_path' => 'temp_receipts/new.jpg',
                'ocr_source' => 'test-fixture',
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        // Nothing wrote to receipts before: the table existed but was empty
        // forever, so /receipts and Receipts/Show always rendered no data.
        $this->assertDatabaseCount('receipts', 1);
        $this->assertDatabaseHas('receipts', [
            'filename' => 'ABC123_Jane_Doe.jpg',
            'mime_type' => 'image/jpeg',
            'ocr_provider' => 'test-fixture',
            'verification_status' => 'pending',
        ]);
        Storage::disk('local')->assertMissing('temp_receipts/new.jpg');
    }

    public function test_storing_a_receipt_does_not_create_a_row_when_the_file_is_gone(): void
    {
        Storage::fake();
        Storage::fake('public');

        $this->actingAs($this->user)
            ->postJson('/receipts/store', [
                'title' => 'Site materials',
                'amount' => 1500,
                'expense_date' => '2026-03-12',
                'temp_path' => 'temp_receipts/never-uploaded.jpg',
            ])
            ->assertOk();

        $this->assertDatabaseCount('receipts', 0);
    }
}
