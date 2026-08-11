<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Expense;
use App\Models\Photo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Scout\Builder;

/**
 * Cross-model full-text search backed by MeiliSearch.
 *
 * Searches Documents, Photos, and Expenses in parallel via Scout's
 * MeiliSearch driver. Results are merged, scored, and grouped by type.
 *
 * Query syntax supports MeiliSearch's typo tolerance and filters:
 *   GET /search?q=brightone
 *   GET /search?q=brightone&type=document
 *   GET /search?q=phone&category=Materials&payment_method=mobile_money
 */
class SearchController extends Controller
{
    /**
     * Render the global search page (used by the sidebar search bar).
     */
    public function index(Request $request)
    {
        $query = trim((string) $request->input('q', ''));
        $type = $request->input('type'); // optional filter
        $perPage = (int) $request->input('per_page', 20);
        $perPage = max(1, min(100, $perPage));

        $results = $query === '' ? [] : $this->runSearch($query, $type, $perPage);

        return Inertia::render('Search/Index', [
            'query'   => $query,
            'type'    => $type,
            'results' => $results,
            'totals'  => [
                'documents' => collect($results)->where('type', 'document')->count(),
                'photos'    => collect($results)->where('type', 'photo')->count(),
                'expenses'  => collect($results)->where('type', 'expense')->count(),
            ],
        ]);
    }

    /**
     * JSON endpoint for live search-as-you-type (sidebar dropdown).
     * Returns top 8 results across all three indexes.
     */
    public function live(Request $request)
    {
        $query = trim((string) $request->input('q', ''));
        if ($query === '' || strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $results = $this->runSearch($query, null, 8);

        return response()->json(['results' => $results]);
    }

    /**
     * Run the actual Scout/MeiliSearch query across all three indexes
     * and hydrate the results back to full Eloquent models for display.
     */
    protected function runSearch(string $query, ?string $typeFilter, int $perPage): array
    {
        $caller = function (Builder $builder) use ($typeFilter, $perPage) {
            $builder->take($perPage);
            if ($typeFilter) {
                $builder->where('type', $typeFilter);
            }
        };

        $results = [];

        if (!$typeFilter || $typeFilter === 'document') {
            try {
                $docs = Document::search($query, $caller)->paginate($perPage);
                foreach ($docs as $d) {
                    $results[] = [
                        'id'        => $d->id,
                        'type'      => 'document',
                        'title'     => $d->title,
                        'subtitle'  => $d->original_name ?? $d->filename,
                        'category'  => $d->category,
                        'thumb_url' => $d->thumb_url,
                        'preview_url' => $d->getFirstMediaUrl('files'),
                        'mime_type' => $d->mime_type,
                        'date'      => optional($d->document_date)->toDateString() ?? $d->created_at->toDateString(),
                        'url'       => '/documents#doc-' . $d->id,
                    ];
                }
            } catch (\Throwable $e) {
                // Index might not exist yet — skip silently
            }
        }

        if (!$typeFilter || $typeFilter === 'photo') {
            try {
                $photos = Photo::search($query, $caller)->paginate($perPage);
                foreach ($photos as $p) {
                    $results[] = [
                        'id'        => $p->id,
                        'type'      => 'photo',
                        'title'     => $p->title,
                        'subtitle'  => $p->location ?? $p->category,
                        'category'  => $p->category,
                        'thumb_url' => $p->thumb_url,
                        'preview_url' => $p->preview_url,
                        'mime_type' => $p->mime_type,
                        'date'      => optional($p->photo_date)->toDateString() ?? $p->created_at->toDateString(),
                        'url'       => '/photos#photo-' . $p->id,
                    ];
                }
            } catch (\Throwable $e) {
                // Index might not exist yet
            }
        }

        if (!$typeFilter || $typeFilter === 'expense') {
            try {
                $expenses = Expense::search($query, $caller)->paginate($perPage);
                foreach ($expenses as $e) {
                    $results[] = [
                        'id'               => $e->id,
                        'type'             => 'expense',
                        'title'            => $e->title,
                        'subtitle'         => $e->recipient ?? $e->reference_number,
                        'category'         => $e->category,
                        'thumb_url'        => $e->receipt_thumb_url,
                        'preview_url'      => $e->getFirstMediaUrl('receipt'),
                        'mime_type'        => null,
                        'date'             => optional($e->expense_date)->toDateString() ?? $e->created_at->toDateString(),
                        'amount'           => $e->amount,
                        'recipient'        => $e->recipient,
                        'reference_number' => $e->reference_number,
                        'url'              => '/expenses#expense-' . $e->id,
                    ];
                }
            } catch (\Throwable $e) {
                // Index might not exist yet
            }
        }

        return $results;
    }
}
