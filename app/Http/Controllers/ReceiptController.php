<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReceiptRequest;
use App\Http\Requests\UpdateReceiptRequest;
use App\Models\Expense;
use App\Services\OcrService;
use App\Services\ReceiptParser;
use App\Services\ReceiptProcessingService;
use Illuminate\Http\Request;
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

    public function analyze(Request $request)
    {
        $request->validate([
            'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf|max:102400',
        ]);

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
    public function analyzeBulk(Request $request)
    {
        $request->validate([
            'receipts'   => 'required|array|max:20',
            'receipts.*' => 'required|file|mimes:jpg,jpeg,png,pdf|max:102400',
        ]);

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
    public function storeBulk(Request $request)
    {
        $request->validate([
            'expenses'   => 'required|array|max:20',
            'expenses.*' => 'required|array',
            'expenses.*.title'           => 'required|string',
            'expenses.*.amount'          => 'nullable|numeric|min:0',
            'expenses.*.expense_date'    => 'required|date',
            'expenses.*.time'            => 'nullable|string',
            'expenses.*.recipient'       => 'nullable|string',
            'expenses.*.payment_method'  => 'nullable|string',
            'expenses.*.reference_number'=> 'nullable|string',
            'expenses.*.purpose'         => 'nullable|string',
            'expenses.*.category'        => 'nullable|string',
            'expenses.*.project_id'      => 'nullable|exists:projects,id',
            'expenses.*.temp_path'       => 'required|string',
        ]);

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
        $matchedExpense = null;

        if ($request->reference_number) {
            $query = Expense::where('reference_number', $request->reference_number)
                ->where('user_id', Auth::id());

            $candidates = $query->get();

            if ($candidates->count() === 1) {
                $matchedExpense = $candidates->first();
            } elseif ($candidates->count() > 1 && $request->expense_date) {
                $matchedExpense = $candidates->firstWhere('expense_date', $request->expense_date);
                if (!$matchedExpense && $request->time) {
                    $matchedExpense = $candidates->first(function ($e) use ($request) {
                        return $e->expense_date === $request->expense_date
                            && $e->time === $request->time;
                    });
                }
                if (!$matchedExpense) {
                    $matchedExpense = $candidates->first();
                }
            }
        }

        if ($matchedExpense) {
            $this->receipts->attachReceiptMedia(
                $matchedExpense,
                $request->temp_path,
                $request->reference_number,
                $request->recipient,
                $request->input('ocr_source', 'local-tesseract'),
                $this->receipts->readReceipt($request->temp_path),
            );

            return response()->json([
                'success' => true,
                'expense' => $matchedExpense->fresh(),
                'matched' => true,
            ]);
        }

        $expense = \App\Models\Expense::withoutSyncingToSearch(fn () => $this->createExpenseFromRequest($request));

        return response()->json(['success' => true, 'expense' => $expense->fresh(), 'matched' => false]);
    }

    public function match(Request $request)
    {
        $request->validate([
            'reference_number' => 'required|string',
            'date' => 'nullable|date',
            'time' => 'nullable|string',
        ]);

        $query = Expense::where('reference_number', $request->reference_number)
            ->where('user_id', Auth::id());

        $candidates = $query->get();

        if ($candidates->isEmpty()) {
            return response()->json(['matched' => false]);
        }

        $matched = null;

        if ($candidates->count() === 1) {
            $matched = $candidates->first();
        } else {
            $matched = $candidates->firstWhere('expense_date', $request->date);
            if (!$matched && $request->time) {
                $matched = $candidates->first(function ($e) use ($request) {
                    return $e->expense_date === $request->date
                        && $e->time === $request->time;
                });
            }
            if (!$matched) {
                $matched = $candidates->first();
            }
        }

        return response()->json([
            'matched' => true,
            'expense' => $matched->load('media'),
        ]);
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

    public function update(Request $request, \App\Models\Receipt $receipt)
    {
        $this->authorize('update', $receipt);

        $validated = $request->validate([
            'verification_status' => 'required|in:pending,verified,rejected,auto_verified',
            'needs_verification' => 'boolean',
        ]);

        $receipt->update($validated);

        return redirect()->back()->with('success', 'Receipt updated successfully');
    }

    public function destroy(\App\Models\Receipt $receipt)
    {
        $this->authorize('delete', $receipt);

        $receipt->delete();

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
