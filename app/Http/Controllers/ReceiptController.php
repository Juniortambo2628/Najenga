<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyzeBulkReceiptRequest;
use App\Http\Requests\AnalyzeReceiptRequest;
use App\Http\Requests\MatchReceiptRequest;
use App\Http\Requests\StoreBulkReceiptRequest;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Requests\UpdateReceiptRequest;
use App\Models\Expense;
use App\Services\ActivityLogger;
use App\Services\OcrService;
use App\Services\ReceiptParser;
use App\Services\ReceiptProcessingService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReceiptController extends Controller
{
    public function __construct(
        protected OcrService $ocr,
        protected ReceiptParser $parser,
        protected ReceiptProcessingService $receipts,
    ) {
    }

    public function index()
    {
        $receipts = \App\Models\Receipt::whereHas('expense', function ($q) {
            $q->where('user_id', auth()->id());
        })->orderBy('created_at', 'desc')->get();

        return \Inertia\Inertia::render('Receipts/Index', [
            'receipts' => $receipts,
        ]);
    }

    public function analyze(AnalyzeReceiptRequest $request)
    {
        try {
            $uploaded = $request->file('receipt');
            $path = $uploaded->store('temp_receipts', 'local');
            $absolutePath = Storage::disk('local')->path($path);

            $result = $this->ocr->extractText($absolutePath);

            if (!($result['success'] ?? false)) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'OCR Failed',
                ], 500);
            }

            $text = $result['text'] ?? '';
            $data = $this->parser->parse($text);

            return response()->json([
                'success'    => true,
                'text'       => $text,
                'confidence' => $result['confidence'] ?? null,
                'source'     => $result['source'] ?? 'unknown',
                'extracted'  => $data,
                'temp_path'  => $path,
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OCR Execution Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'OCR Failed: ' . $e->getMessage(),
            ], 500);
        }
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
                $absolutePath = Storage::disk('local')->path($path);

                $ocrResult = $this->ocr->extractText($absolutePath);

                if (!($ocrResult['success'] ?? false)) {
                    $results[] = [
                        'index'      => $index,
                        'filename'   => $uploaded->getClientOriginalName(),
                        'success'    => false,
                        'message'    => $ocrResult['message'] ?? 'OCR Failed',
                        'temp_path'  => $path,
                    ];
                    continue;
                }

                $text = $ocrResult['text'] ?? '';
                $data = $this->parser->parse($text);

                $results[] = [
                    'index'      => $index,
                    'filename'   => $uploaded->getClientOriginalName(),
                    'success'    => true,
                    'text'       => $text,
                    'confidence' => $ocrResult['confidence'] ?? null,
                    'source'     => $ocrResult['source'] ?? 'unknown',
                    'extracted'  => $data,
                    'temp_path'  => $path,
                ];
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

                $saved[] = ['index' => $index, 'expense' => $expense->fresh()];
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

            $this->receipts->attachReceiptMedia(
                $matchedExpense,
                $request->temp_path,
                $request->reference_number,
                $request->recipient,
                $request->input('ocr_source', 'local-tesseract'),
                $this->receipts->readReceipt($request->temp_path),
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

        return response()->json([
            'matched' => true,
            'expense' => $matched->load('media'),
        ]);
    }

    /**
     * Expenses the current user owns that share this reference number.
     */
    private function matchingExpenses(?string $referenceNumber): \Illuminate\Database\Eloquent\Collection
    {
        if (!$referenceNumber) {
            return new \Illuminate\Database\Eloquent\Collection();
        }

        return Expense::where('reference_number', $referenceNumber)
            ->where('user_id', Auth::id())
            ->get();
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

        return \Inertia\Inertia::render('Receipts/Show', [
            'receipt' => $receipt->load('expense'),
        ]);
    }

    public function edit(\App\Models\Receipt $receipt)
    {
        $this->authorize('view', $receipt);

        return \Inertia\Inertia::render('Receipts/Edit', [
            'receipt' => $receipt->load('expense'),
        ]);
    }

    public function update(UpdateReceiptRequest $request, \App\Models\Receipt $receipt)
    {
        $this->authorize('update', $receipt);

        $receipt->update($request->validated());

        return redirect()->back()->with('success', 'Receipt updated successfully');
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
            'title'            => $request->title ?: 'Untitled',
            'amount'           => $request->amount ?? 0,
            'expense_date'     => $request->expense_date ?: now()->toDateString(),
            'time'             => $request->time,
            'recipient'        => $request->recipient,
            'payment_method'   => $request->payment_method ?? 'other',
            'reference_number' => $request->reference_number,
            'purpose'          => $request->purpose,
            'category'         => $request->category ?? 'Other',
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

        return $expense;
    }
}
