<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\StoreBatchExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use App\Models\Project;
use App\Traits\HasProjectScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    use HasProjectScope;
    public function index()
    {
        $user = auth()->user();
        return Inertia::render('Expenses', [
            'expenses' => Expense::where('user_id', $user->id)
                ->with('project:id,name')
                ->orderBy('expense_date', 'desc')
                ->get()
                ->map(fn($e) => [
                    'id' => $e->id,
                    'title' => $e->title,
                    'description' => $e->description,
                    'amount' => $e->amount,
                    'currency' => $e->currency ?? 'KES',
                    'category' => $e->category,
                    'payment_method' => $e->payment_method,
                    'recipient' => $e->recipient,
                    'reference_number' => $e->reference_number,
                    'purpose' => $e->purpose,
                    'time' => $e->time,
                    'receipt_id' => $e->receipt_id,
                    'receipt_url' => $e->getFirstMediaUrl('receipt') ?: null,
                    'expense_date' => $e->expense_date->format('Y-m-d'),
                    'status' => $e->status,
                    'project_id' => $e->project_id,
                    'project_name' => $e->project?->name ?? 'N/A',
                ]),
            'projects' => $this->getClientProjects()
        ]);
    }

    public function create()
    {
        return Inertia::render('Expenses/Create', [
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function store(StoreExpenseRequest $request)
    {
        Expense::create([
            ...$request->validated(),
            'user_id' => auth()->id(),
            'currency' => $request->input('currency', 'KES'),
            'status' => 'paid',
        ]);

        return redirect()->back()->with('success', 'Expense added successfully');
    }

    public function batchStore(StoreBatchExpenseRequest $request)
    {
        $user = auth()->user();

        $saved = [];
        $errors = [];

        Expense::withoutSyncingToSearch(function () use ($request, $user, &$saved, &$errors) {
            DB::transaction(function () use ($request, $user, &$saved, &$errors) {
                foreach ($request->input('expenses') as $index => $row) {
                    try {
                        $expense = Expense::create([
                            'title' => $row['title'],
                            'amount' => $row['amount'],
                            'category' => $row['category'],
                            'project_id' => $row['project_id'] ?? null,
                            'expense_date' => $row['expense_date'],
                            'description' => $row['description'] ?? null,
                            'payment_method' => $row['payment_method'] ?? null,
                            'recipient' => $row['recipient'] ?? null,
                            'reference_number' => $row['reference_number'] ?? null,
                            'purpose' => $row['purpose'] ?? null,
                            'time' => $row['time'] ?? null,
                            'currency' => $row['currency'] ?? 'KES',
                            'status' => $row['status'] ?? 'draft',
                            'user_id' => $user->id,
                        ]);
                        $saved[] = ['index' => $index, 'id' => $expense->id];
                    } catch (\Exception $e) {
                        $errors[] = ['index' => $index, 'error' => $e->getMessage()];
                    }
                }
            });
        });

        return response()->json([
            'saved' => $saved,
            'errors' => $errors,
            'saved_count' => count($saved),
            'error_count' => count($errors),
        ]);
    }

    public function show(Expense $expense)
    {
        $this->authorize('view', $expense);

        return response()->json(
            $expense->load('project:id,name')
                ->append('receipt_url', 'receipt_thumb_url')
        );
    }

    public function uploadReceipt(Request $request, Expense $expense)
    {
        $this->authorize('update', $expense);

        $request->validate([
            'receipt' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ]);

        $expense->clearMediaCollection('receipt');

        $expense
            ->addMediaFromRequest('receipt')
            ->usingName($request->file('receipt')->getClientOriginalName())
            ->withCustomProperties([
                'uploaded_by' => auth()->id(),
            ])
            ->toMediaCollection('receipt');

        return response()->json([
            'success' => true,
            'receipt_url' => $expense->getFirstMediaUrl('receipt'),
            'receipt_thumb_url' => $expense->getFirstMediaUrl('receipt', 'thumb'),
        ]);
    }

    public function removeReceipt(Expense $expense)
    {
        $this->authorize('update', $expense);

        $expense->clearMediaCollection('receipt');

        return response()->json(['success' => true]);
    }

    public function edit(Expense $expense)
    {
        $this->authorize('update', $expense);

        return Inertia::render('Expenses/Edit', [
            'expense' => $expense,
            'projects' => $this->getClientProjects(),
        ]);
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $expense->update($request->validated());

        return redirect()->back()->with('success', 'Expense updated successfully');
    }

    public function destroy(Request $request, Expense $expense)
    {
        $this->authorize('delete', $expense);

        Expense::withoutSyncingToSearch(fn () => $expense->delete());

        return redirect()->back()->with('success', 'Expense deleted successfully');
    }
}
