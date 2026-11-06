<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyzeBulkReceiptRequest;
use App\Http\Requests\AnalyzeReceiptRequest;
use App\Http\Requests\FileReceiptDocumentRequest;
use App\Http\Requests\MatchReceiptRequest;
use App\Http\Requests\StoreBulkReceiptRequest;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Requests\UpdateReceiptRequest;
use App\Models\Document;
use App\Models\Expense;
use App\Services\ActivityLogger;
use App\Services\OcrService;
use App\Services\ReceiptParser;
use App\Services\ReceiptProcessingService;
use App\Services\Receipts\ReceiptReader;
use App\Traits\HasProjectScope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReceiptController extends Controller
{
    use HasProjectScope;
    public function __construct(
        protected OcrService $ocr,
        protected ReceiptParser $parser,
        protected ReceiptProcessingService $receipts,
        protected ReceiptReader $reader,
    ) {
    }

    public function verification()
    {
        return \App\Http\Page::render('ReceiptVerification', [
            'projects' => $this->getEditableProjects(),
        ]);
    }

    public function index()
    {
        $receipts = \App\Models\Receipt::whereHas('expense', fn ($q) => $q->visibleTo(auth()->user()))->orderBy('created_at', 'desc')->get();

        return \App\Http\Page::render('Receipts/Index', [
            'receipts' => $receipts,
        ]);
    }

    public function analyze(AnalyzeReceiptRequest $request)
    {
        try {
            $uploaded = $request->file('receipt');
            $path = $uploaded->store('temp_receipts', 'local');
            $result = $this->readUpload($path);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                ], 500);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OCR Execution Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'OCR Failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Read one uploaded file: what it is (payments, a flight ticket, a
     * receipt, or an invoice / quotation to file as a document), and an
     * expense for each payment in it. Each expense gets its own copy of
     * the file, so saving one doesn't take the file from the others.
     *
     * @return array<string, mixed>
     */
    private function readUpload(string $path): array
    {
        $ocr = $this->ocr->extractText(Storage::disk('local')->path($path));
        if (!($ocr['success'] ?? false)) {
            return ['success' => false, 'message' => $ocr['message'] ?? 'OCR Failed', 'temp_path' => $path];
        }

        $text = $ocr['text'] ?? '';
        $reading = $this->reader->read($text, $ocr['alternatives'] ?? []);

        $expenses = [];
        foreach ($reading['expenses'] as $i => $expense) {
            $expenses[] = [
                'title'            => $expense['title'],
                'amount'           => $expense['amount'],
                'expense_date'     => $expense['date'],
                'time'             => $expense['time'],
                'recipient'        => $expense['recipient'],
                'payment_method'   => $expense['payment_method'],
                'reference_number' => $expense['reference_number'],
                'purpose'          => $expense['purpose'],
                'category'         => $expense['category'],
                'account'          => $expense['account'] ?? null,
                'phone'            => $expense['phone'] ?? null,
                'source'           => $expense['source'],
                'needs_check'      => $expense['needs_check'],
                'temp_path'        => $i === 0 ? $path : $this->copyUpload($path, $i),
            ];
        }

        $first = $reading['expenses'][0] ?? null;

        return [
            'success'    => true,
            'kind'       => $reading['kind'],
            'summary'    => $reading['summary'],
            'expenses'   => $expenses,
            'document'   => $reading['document'] ? $reading['document'] + ['temp_path' => $path] : null,
            'text'       => $text,
            'confidence' => $ocr['confidence'] ?? null,
            'source'     => $ocr['source'] ?? 'unknown',
            // The first expense in the older shape, for older callers.
            'extracted'  => $first ? [
                'merchant'         => $first['title'],
                'recipient'        => $first['recipient'],
                'date'             => $first['date'],
                'time'             => $first['time'],
                'total'            => $first['amount'],
                'reference_number' => $first['reference_number'],
                'payment_method'   => $first['payment_method'],
                'purpose'          => $first['purpose'],
            ] : $this->parser->parse($text),
            'temp_path'  => $path,
        ];
    }

    private function copyUpload(string $path, int $index): string
    {
        $copy = preg_replace('/(\.[A-Za-z0-9]+)?$/', '-' . ($index + 1) . '$1', $path, 1);
        Storage::disk('local')->copy($path, $copy);

        return $copy;
    }

    /**
     * File an uploaded invoice or quotation under the project's documents:
     * it isn't an expense until it's paid (the payment is the expense).
     */
    public function fileDocument(FileReceiptDocumentRequest $request)
    {
        $projectId = (int) $request->project_id;
        if (!$this->getEditableProjects()->contains(fn (array $project) => (int) $project['id'] === $projectId)) {
            abort(403, 'You can\'t add documents to this project.');
        }

        $disk = Storage::disk('local');
        if (!$disk->exists($request->temp_path)) {
            return response()->json(['success' => false, 'message' => 'That upload is gone: upload the file again.'], 422);
        }

        $name = $request->original_name ?: basename($request->temp_path);
        $document = Document::create([
            'user_id'       => Auth::id(),
            'project_id'    => $projectId,
            'title'         => $request->title,
            'description'   => $request->description,
            'category'      => $request->category,
            'document_date' => $request->document_date,
            'original_name' => $name,
            'filename'      => $name,
            'file_path'     => '',
            'file_size'     => $disk->size($request->temp_path),
            'mime_type'     => $disk->mimeType($request->temp_path),
        ]);

        $media = $document
            ->addMediaFromDisk($request->temp_path, 'local')
            ->usingName($name)
            ->withCustomProperties(['original_name' => $name, 'source' => 'receipt_verification'])
            ->toMediaCollection('files', 'public');
        $document->update(['file_path' => \Illuminate\Support\Str::after($media->getUrl(), '/storage/')]);

        ActivityLogger::log('document.filed', sprintf('Filed %s "%s" from Receipt Verification', $request->category === 'quote' ? 'quotation' : 'invoice', $document->title), $document);

        return response()->json(['success' => true, 'document' => $document->fresh()]);
    }

    /**
     * Bulk analyze multiple receipts at once.
     * Accepts up to 20 files. Returns extracted data for each.
     */
    public function analyzeBulk(AnalyzeBulkReceiptRequest $request)
    {
        $results = [];
        $files = $request->file('receipts');

        foreach ($files as $index => $uploaded) {
            try {
                $path = $uploaded->store('temp_receipts', 'local');
                $result = $this->readUpload($path);
                $results[] = ['index' => $index, 'filename' => $uploaded->getClientOriginalName()] + ($result['success'] ? $result : [
                    'success'   => false,
                    'message'   => $result['message'],
                    'temp_path' => $path,
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Bulk OCR Failed for file #{$index}: " . $e->getMessage());
                $results[] = [
                    'index'    => $index,
                    'filename' => $uploaded->getClientOriginalName(),
                    'success'  => false,
                    'message'  => 'OCR Failed: ' . $e->getMessage(),
                ];
            }
        }

        // Overlapping screenshots show the same payment twice: the later
        // copy is marked, so it isn't saved twice.
        $seen = [];
        foreach ($results as &$result) {
            foreach ($result['expenses'] ?? [] as $i => $expense) {
                $ref = $expense['reference_number'] ?? null;
                if (!is_string($ref) || strlen($ref) < 6) {
                    continue;
                }
                if (isset($seen[$ref])) {
                    $result['expenses'][$i]['duplicate_of'] = $seen[$ref];
                } else {
                    $seen[$ref] = $result['filename'];
                }
            }
        }
        unset($result);

        return response()->json([
            'success' => true,
            'count'   => count($results),
            'results' => $results,
        ]);
    }

    /**
     * Bulk store multiple expenses at once.
     */
    public function storeBulk(StoreBulkReceiptRequest $request)
    {
        $saved = [];
        $errors = [];

        foreach ($request->input('expenses') as $index => $expenseData) {
            try {
                $matchedExpense = $this->pickMatchingExpense(
                    $this->matchingExpenses($expenseData['reference_number'] ?? null),
                    $expenseData['expense_date'] ?? null,
                    $expenseData['time'] ?? null,
                );

                if ($matchedExpense) {
                    if (! empty($expenseData['update_matched'])) {
                        $matchedExpense->update(collect($expenseData)->only([
                            'title', 'amount', 'expense_date', 'time', 'recipient', 'payment_method',
                            'reference_number', 'purpose', 'category',
                        ])->all());
                    }
                    $tempPath = $expenseData['temp_path'];
                    $this->receipts->attachReceiptMedia(
                        $matchedExpense,
                        $tempPath,
                        $expenseData['reference_number'] ?? null,
                        $expenseData['recipient'] ?? null,
                        $expenseData['ocr_source'] ?? 'local-tesseract',
                        $this->receipts->readReceipt($tempPath),
                    );
                    $this->saveReceiptExpenseData($matchedExpense, $expenseData, ! empty($expenseData['update_matched']));
                    $saved[] = ['index' => $index, 'expense' => $matchedExpense->fresh(), 'matched' => true];
                    continue;
                }

                $amount = isset($expenseData['amount']) && $expenseData['amount'] !== '' ? $expenseData['amount'] : 0;
                $expense = \App\Models\Expense::withoutSyncingToSearch(function () use ($expenseData, $index, $amount) {
                    return Expense::create([
                        'user_id'          => Auth::id(),
                        'title'            => $expenseData['title'] ?: 'Untitled',
                        'amount'           => $amount,
                        'expense_date'     => $expenseData['expense_date'] ?: now()->toDateString(),
                        'time'             => $expenseData['time'] ?? null,
                        'recipient'        => $expenseData['recipient'] ?? null,
                        'payment_method'   => $expenseData['payment_method'] ?? 'other',
                        'reference_number' => $expenseData['reference_number'] ?? null,
                        'purpose'          => $expenseData['purpose'] ?? null,
                        'category'         => $expenseData['category'] ?? 'Other',
                        'project_id'       => $expenseData['project_id'] ?? null,
                    ]);
                });

                $tempPath = $expenseData['temp_path'];
                $ocr = $this->receipts->readReceipt($tempPath);

                $this->receipts->attachReceiptMedia(
                    $expense,
                    $tempPath,
                    $expenseData['reference_number'] ?? null,
                    $expenseData['recipient'] ?? null,
                    $expenseData['ocr_source'] ?? 'local-tesseract',
                    $ocr,
                );
                $this->saveReceiptExpenseData($expense, $expenseData, true);

                $saved[] = ['index' => $index, 'expense' => $expense->fresh(), 'matched' => false];
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Bulk store failed for expense #{$index}: " . $e->getMessage());
                $errors[] = ['index' => $index, 'message' => $e->getMessage()];
            }
        }

        return response()->json([
            'success' => true,
            'saved'   => $saved,
            'errors'  => $errors,
            'count'   => count($saved),
        ]);
    }

    public function store(StoreReceiptRequest $request)
    {
        $matchedExpense = $this->pickMatchingExpense(
            $this->matchingExpenses($request->reference_number),
            $request->expense_date,
            $request->time,
        );

        if ($matchedExpense) {
            $this->authorize('update', $matchedExpense);

            if ($request->boolean('update_matched')) {
                $matchedExpense->update($this->expenseDetailsFromRequest($request));
            }

            $this->receipts->attachReceiptMedia(
                $matchedExpense,
                $request->temp_path,
                $request->reference_number,
                $request->recipient,
                $request->input('ocr_source', 'local-tesseract'),
                $this->receipts->readReceipt($request->temp_path),
            );
            $this->saveReceiptExpenseData(
                $matchedExpense,
                $this->expenseDetailsFromRequest($request),
                $request->boolean('update_matched'),
            );

            ActivityLogger::log('receipt.attached', sprintf('Attached a receipt to expense (#%d)', $matchedExpense->id), $matchedExpense);

            return response()->json([
                'success' => true,
                'expense' => $matchedExpense->fresh(),
                'matched' => true,
            ]);
        }

        $expense = \App\Models\Expense::withoutSyncingToSearch(fn () => $this->createExpenseFromRequest($request));

            ActivityLogger::log('receipt.created', sprintf('Created expense (#%d) from a receipt', $expense->id), $expense);

        return response()->json(['success' => true, 'expense' => $expense->fresh(), 'matched' => false]);
    }

    public function match(MatchReceiptRequest $request)
    {
        $candidates = $this->matchingExpenses($request->reference_number);

        if ($candidates->isEmpty()) {
            return response()->json(['matched' => false]);
        }

        $matched = $this->pickMatchingExpense($candidates, $request->date, $request->time)
            ?? $candidates->first();

        if (! $request->user()->can('view', $matched)) {
            return response()->json(['matched' => false]);
        }

        return response()->json([
            'matched' => true,
            'expense' => $matched->load('media'),
        ]);
    }

    /**
     * Expenses the user can change that share this reference number.
     */
    private function matchingExpenses(?string $referenceNumber): \Illuminate\Database\Eloquent\Collection
    {
        if (!$referenceNumber) {
            return new \Illuminate\Database\Eloquent\Collection();
        }

        return Expense::where('reference_number', $referenceNumber)
            ->visibleTo(Auth::user())
            ->with('project')
            ->get()
            ->filter(fn (Expense $expense) => Auth::user()->can('update', $expense))
            ->values();
    }

    /**
     * Decide which of several candidates a receipt belongs to: a single
     * candidate outright, or several disambiguated by date (then by time).
     *
     * Returns null when the candidates stay ambiguous, which is what makes
     * ReceiptController::store() create a new expense instead of guessing.
     */
    private function pickMatchingExpense(
        \Illuminate\Database\Eloquent\Collection $candidates,
        ?string $date,
        ?string $time,
    ): ?Expense {
        if ($candidates->count() === 1) {
            return $candidates->first();
        }

        if ($candidates->count() > 1 && $date) {
            $matched = $candidates->firstWhere('expense_date', $date);

            if (!$matched && $time) {
                $matched = $candidates->first(fn ($e) => $e->expense_date === $date
                    && $e->time === $time);
            }

            return $matched ?? $candidates->first();
        }

        return null;
    }

    public function show(\App\Models\Receipt $receipt)
    {
        $this->authorize('view', $receipt);

        $receipt->load('expense.project:id,name');

        return \App\Http\Page::render('Receipts/Show', [
            'receipt' => $receipt,
            'fileUrl' => $receipt->expense?->getFirstMediaUrl('receipt') ?: null,
        ]);
    }

    public function edit(\App\Models\Receipt $receipt)
    {
        $this->authorize('view', $receipt);

        return \App\Http\Page::render('Receipts/Edit', [
            'receipt' => $receipt->load('expense'),
        ]);
    }

    public function update(UpdateReceiptRequest $request, \App\Models\Receipt $receipt)
    {
        $this->authorize('update', $receipt);

        $attributes = collect($request->validated())->except('update_matched')->all();
        if (($attributes['verification_status'] ?? null) === 'verified') {
            $attributes['needs_verification'] = false;
        }
        $receipt->update($attributes);

        if ($receipt->verification_status === 'verified') {
            $this->applyReceiptDetailsToExpense($receipt);
        }

        return redirect()->back()->with('success', 'Receipt updated successfully');
    }

    /** Read the receipt again, with the current parser (and OCR, if it was never read). */
    public function readAgain(\App\Models\Receipt $receipt)
    {
        $this->authorize('update', $receipt);

        return $this->receipts->readAgain($receipt)
            ? redirect()->back()->with('success', 'Receipt read again')
            : redirect()->back()->with('error', "Couldn't read this receipt");
    }

    public function destroy(\App\Models\Receipt $receipt)
    {
        $this->authorize('delete', $receipt);

        $receipt->delete();

        ActivityLogger::log('receipt.deleted', sprintf('Deleted receipt %s', $receipt->original_name));

        return redirect()->back()->with('success', 'Receipt deleted successfully');
    }

    /**
     * Create an expense from validated receipt data and attach the receipt media.
     */
    private function createExpenseFromRequest(StoreReceiptRequest $request): Expense
    {
        $expense = Expense::create([
            'user_id'          => Auth::id(),
            ...$this->expenseDetailsFromRequest($request),
            'project_id'       => $request->project_id,
        ]);

        $this->receipts->attachReceiptMedia(
            $expense,
            $request->temp_path,
            $request->reference_number,
            $request->recipient,
            $request->input('ocr_source', 'local-tesseract'),
            $this->receipts->readReceipt($request->temp_path),
        );
        $this->saveReceiptExpenseData($expense, $this->expenseDetailsFromRequest($request), true);

        return $expense;
    }

    private function expenseDetailsFromRequest(StoreReceiptRequest $request): array
    {
        return [
            'title' => $request->title ?: 'Untitled',
            'amount' => $request->amount ?? 0,
            'expense_date' => $request->expense_date ?: now()->toDateString(),
            'time' => $request->time,
            'recipient' => $request->recipient,
            'payment_method' => $request->payment_method ?? 'other',
            'reference_number' => $request->reference_number,
            'purpose' => $request->purpose,
            'category' => $request->category ?? 'Other',
        ];
    }

    private function applyReceiptDetailsToExpense(\App\Models\Receipt $receipt): void
    {
        $details = $receipt->ocr_data ?? [];
        $expense = $receipt->expense;
        if (! $expense || ! is_array($details) || ($details['_sync_to_expense_on_verify'] ?? true) === false) {
            return;
        }

        $expense->update(array_filter([
            'title' => $details['merchant'] ?? $details['recipient'] ?? null,
            'amount' => $details['total'] ?? null,
            'expense_date' => $details['date'] ?? null,
            'time' => $details['time'] ?? null,
            'recipient' => $details['recipient'] ?? null,
            'payment_method' => $details['payment_method'] ?? null,
            'reference_number' => $details['reference_number'] ?? null,
        ], fn ($value) => $value !== null && $value !== ''));
    }

    /** Preserve corrected values and the user's consent for later verification. */
    private function saveReceiptExpenseData(Expense $expense, array $data, bool $syncOnVerify): void
    {
        $receipt = $expense->receipt()->first();
        if (! $receipt) {
            return;
        }

        $ocrData = is_array($receipt->ocr_data) ? $receipt->ocr_data : [];
        $receipt->update([
            'ocr_data' => array_merge($ocrData, [
                'merchant' => $data['title'] ?? null,
                'recipient' => $data['recipient'] ?? null,
                'total' => $data['amount'] ?? null,
                'date' => $data['expense_date'] ?? null,
                'time' => $data['time'] ?? null,
                'payment_method' => $data['payment_method'] ?? null,
                'reference_number' => $data['reference_number'] ?? null,
                'purpose' => $data['purpose'] ?? null,
                '_sync_to_expense_on_verify' => $syncOnVerify,
            ]),
            'extracted_amount' => $data['amount'] ?? null,
            'extracted_date' => $data['expense_date'] ?? null,
            'extracted_merchant' => $data['title'] ?? $data['recipient'] ?? null,
            'extracted_receipt_id' => $data['reference_number'] ?? null,
        ]);
    }
}
