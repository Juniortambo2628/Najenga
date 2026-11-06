<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Expense;
use App\Models\Project;
use App\Models\User;
use App\Services\OcrService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Receipt Verification reads what an upload is: every payment in it, a
 * flight ticket, or an invoice / quotation to file as a document.
 */
class ReceiptReadingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake();
        Storage::fake('public');
        $this->user = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->user->id]);
    }

    /** OCR that reads each upload, in turn, as these texts (then the last again). */
    private function ocrReads(string ...$texts): void
    {
        $ocr = $this->createMock(OcrService::class);
        $call = 0;
        $ocr->method('extractText')->willReturnCallback(function () use ($texts, &$call) {
            $text = $texts[min($call++, count($texts) - 1)];

            return ['success' => true, 'text' => $text, 'confidence' => 0.9, 'source' => 'test-fixture'];
        });
        $this->app->instance(OcrService::class, $ocr);
    }

    private function upload(string $name = 'chat.jpg'): UploadedFile
    {
        return UploadedFile::fake()->image($name, 60, 120);
    }

    private const CHAT = <<<'TXT'
QA1B23CDEF Confirmed. Ksh18,400.00 sent to Equity Paybill Account for account 445566 on 1/11/26 at 1:38 PM
For Sand and Ballast
Fuel
QD4E56FGHJ Confirmed. Ksh5,500.00 paid to RUBIS ENERGY - MOMBASA ROAD. on 30/10/26 at 8:08 AM.
TXT;

    public function test_a_screenshot_with_several_payments_gives_an_expense_for_each_with_its_own_copy_of_the_file(): void
    {
        $this->ocrReads(self::CHAT);

        $response = $this->actingAs($this->user)
            ->post('/receipts/analyze', ['receipt' => $this->upload()], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('kind', 'payments')
            ->assertJsonPath('document', null)
            ->assertJsonCount(2, 'expenses')
            ->assertJsonPath('expenses.0.amount', 18400)
            ->assertJsonPath('expenses.0.purpose', 'Sand and Ballast')
            ->assertJsonPath('expenses.0.reference_number', 'QA1B23CDEF')
            ->assertJsonPath('expenses.0.expense_date', '2026-11-01')
            ->assertJsonPath('expenses.1.amount', 5500)
            ->assertJsonPath('expenses.1.title', 'Fuel')
            ->assertJsonPath('expenses.1.category', 'Transport')
            // The older single-receipt shape is still there for older callers.
            ->assertJsonPath('extracted.total', 18400);

        $first = $response->json('expenses.0.temp_path');
        $second = $response->json('expenses.1.temp_path');
        $this->assertNotSame($first, $second);
        Storage::disk('local')->assertExists($first);
        Storage::disk('local')->assertExists($second);

        // Saving both: each takes its own copy.
        foreach ($response->json('expenses') as $expense) {
            $this->actingAs($this->user)->postJson('/receipts/store', [
                ...$expense,
                'project_id' => $this->project->id,
            ])->assertOk()->assertJsonPath('matched', false);
        }
        $this->assertSame([18400.0, 5500.0], Expense::orderBy('id')->pluck('amount')->map(fn ($a) => (float) $a)->all());
        $this->assertDatabaseCount('receipts', 2);
    }

    public function test_the_same_payment_in_two_overlapping_screenshots_is_marked_once_seen(): void
    {
        $this->ocrReads(
            self::CHAT,
            "QD4E56FGHJ Confirmed. Ksh5,500.00 paid to RUBIS ENERGY - MOMBASA ROAD. on 30/10/26 at 8:08 AM.\nAccommodation\nQE5F67GHJK Confirmed. Ksh3,200.00 sent to MARY WANJIKU 0722111222 on 1/11/26 at 12:05 PM.",
        );

        $this->actingAs($this->user)
            ->post('/receipts/analyze-bulk', ['receipts' => [$this->upload('one.jpg'), $this->upload('two.jpg')]], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('results.0.expenses.1.reference_number', 'QD4E56FGHJ')
            ->assertJsonMissingPath('results.0.expenses.1.duplicate_of')
            ->assertJsonPath('results.1.expenses.0.reference_number', 'QD4E56FGHJ')
            ->assertJsonPath('results.1.expenses.0.duplicate_of', 'one.jpg')
            ->assertJsonMissingPath('results.1.expenses.1.duplicate_of')
            ->assertJsonPath('results.1.expenses.1.purpose', 'Accommodation');
    }

    public function test_a_flight_ticket_is_one_expense(): void
    {
        $this->ocrReads("Thank you for travelling with Jambojet\nBooking Reference / PNR K7Q2ZX\nOutbound: NBO - MBA\nReturn: MBA - NBO\nTotal Paid: KES 18,200\nPayment Type Visa\nPayment Date Tuesday 20 October 2026");

        $this->actingAs($this->user)
            ->post('/receipts/analyze', ['receipt' => $this->upload('ticket.jpg')], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('kind', 'flight')
            ->assertJsonCount(1, 'expenses')
            ->assertJsonPath('expenses.0.amount', 18200)
            ->assertJsonPath('expenses.0.reference_number', 'K7Q2ZX')
            ->assertJsonPath('expenses.0.payment_method', 'card')
            ->assertJsonPath('expenses.0.category', 'Transport');
    }

    public function test_an_invoice_is_offered_as_a_document_and_filed_under_documents(): void
    {
        $this->ocrReads("Mwangi Building Supplies Ltd\nTax invoice\nInvoice no: INV-00123\nBill to: JANE DOE\nDate: Oct 29, 2026 · Due: Nov 12, 2026\nGrand total: KES 18,400.00\nPaid: KES 0.00");

        $response = $this->actingAs($this->user)
            ->post('/receipts/analyze', ['receipt' => UploadedFile::fake()->create('invoice.pdf', 20, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('kind', 'invoice')
            ->assertJsonCount(0, 'expenses')
            ->assertJsonPath('document.type', 'invoice')
            ->assertJsonPath('document.number', 'INV-00123')
            ->assertJsonPath('document.issuer', 'Mwangi Building Supplies Ltd')
            ->assertJsonPath('document.total', 18400);

        $this->actingAs($this->user)->postJson('/receipts/file-document', [
            'temp_path'     => $response->json('document.temp_path'),
            'original_name' => 'invoice.pdf',
            'project_id'    => $this->project->id,
            'category'      => 'invoice',
            'title'         => 'Invoice INV-00123 — Mwangi Building Supplies Ltd',
            'description'   => 'KES 18,400.00, due 12 Nov 2026',
            'document_date' => '2026-10-29',
        ])->assertOk()->assertJsonPath('success', true);

        $document = Document::sole();
        $this->assertSame('invoice', $document->category);
        $this->assertSame($this->project->id, $document->project_id);
        $this->assertSame('2026-10-29', $document->document_date->toDateString());
        $this->assertNotNull($document->getFirstMedia('files'));
        $this->assertNotSame('', $document->file_path);
        $this->assertDatabaseCount('expenses', 0);
        Storage::disk('local')->assertMissing($response->json('document.temp_path'));
    }

    public function test_a_quotation_is_filed_with_its_own_category(): void
    {
        Storage::disk('local')->put('temp_receipts/quote.pdf', '%PDF-1.4 quote');

        $this->actingAs($this->user)->postJson('/receipts/file-document', [
            'temp_path'  => 'temp_receipts/quote.pdf',
            'project_id' => $this->project->id,
            'category'   => 'quote',
            'title'      => 'Quotation QT-2026-045',
        ])->assertOk();

        $this->assertSame('quote', Document::sole()->category);
    }

    public function test_filing_needs_a_project_the_person_can_edit_and_an_uploaded_file(): void
    {
        Storage::disk('local')->put('temp_receipts/quote.pdf', '%PDF-1.4 quote');
        $theirs = Project::factory()->create(['client_id' => User::factory()->create(['role' => 'client'])->id]);
        $base = ['temp_path' => 'temp_receipts/quote.pdf', 'category' => 'quote', 'title' => 'Quotation'];

        $this->actingAs($this->user)->postJson('/receipts/file-document', $base)
            ->assertStatus(422)->assertJsonValidationErrors('project_id');
        $this->actingAs($this->user)->postJson('/receipts/file-document', $base + ['project_id' => $theirs->id])
            ->assertForbidden();
        $this->actingAs($this->user)->postJson('/receipts/file-document', ['temp_path' => '../../.env', 'project_id' => $this->project->id] + $base)
            ->assertStatus(422)->assertJsonValidationErrors('temp_path');
        $this->actingAs($this->user)->postJson('/receipts/file-document', ['temp_path' => 'temp_receipts/gone.pdf', 'project_id' => $this->project->id] + $base)
            ->assertStatus(422);

        $this->assertDatabaseCount('documents', 0);
    }

    public function test_saving_only_takes_files_uploaded_for_reading(): void
    {
        $this->actingAs($this->user)->postJson('/receipts/store', [
            'title' => 'Sneaky', 'expense_date' => '2026-11-01', 'temp_path' => 'receipts/someone-elses.jpg',
        ])->assertStatus(422)->assertJsonValidationErrors('temp_path');
    }
}
