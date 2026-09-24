<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Photo;
use App\Models\User;
use App\Models\WhatsAppLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The user-visible /whatsapp page: a timeline of inbound + outbound WhatsApp
 * activity for the current user (all activity, if they're an admin) plus a
 * "Filed via WhatsApp" strip showing the expenses (and best-effort photos)
 * that came out of the last batch of messages. The settings/config page is
 * a separate route (/whatsapp/settings) guarded by the admin middleware.
 */
class WhatsAppActivityController extends Controller
{
    private const LOGS_PER_PAGE = 100;
    private const FILED_PER_LIST = 25;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user?->role === 'admin';

        $direction = $request->string('direction')->toString();  // '', 'inbound', 'outbound'
        $status = $request->string('status')->toString();        // '', 'sent', 'received', 'failed', ...
        $q = trim($request->string('q')->toString());

        $logs = WhatsAppLog::query()
            ->with('filed')
            ->when(! $isAdmin, fn ($qq) => $qq->where('user_id', $user?->id))
            ->when(in_array($direction, ['inbound', 'outbound'], true),
                fn ($qq) => $qq->where('direction', $direction))
            ->when($status !== '', fn ($qq) => $qq->where('status', $status))
            ->when($q !== '', fn ($qq) => $qq->where(function ($w) use ($q) {
                $w->where('message', 'like', "%{$q}%")
                  ->orWhere('phone_number', 'like', "%{$q}%")
                  ->orWhere('message_id', 'like', "%{$q}%");
            }))
            ->orderByDesc('timestamp')
            ->orderByDesc('id')
            ->limit(self::LOGS_PER_PAGE)
            ->get();

        // Attach display name for each log row when the user is known — cheap
        // batch lookup that keeps the frontend from making one call per row.
        $userIds = $logs->pluck('user_id')->filter()->unique()->values();
        $userMap = User::whereIn('id', $userIds)
            ->get(['id', 'first_name', 'last_name', 'email'])
            ->keyBy('id');

        $items = $logs->map(function (WhatsAppLog $l) use ($userMap) {
            $u = $l->user_id ? $userMap->get($l->user_id) : null;
            return [
                'id' => $l->id,
                'direction' => $l->direction,
                'status' => $l->status,
                'phone_number' => $l->phone_number,
                'user' => $u ? [
                    'id' => $u->id,
                    'name' => trim(($u->first_name ?? '').' '.($u->last_name ?? '')) ?: $u->email,
                    'email' => $u->email,
                ] : null,
                'message' => (string) $l->message,
                'preview' => Str::limit((string) $l->message, 200, '…'),
                'message_id' => $l->message_id,
                'error_message' => $l->error_message,
                'timestamp' => $l->timestamp?->toIso8601String(),
                'filed' => $this->serializeFiled($l),
            ];
        })->values();

        $filedExpenses = Expense::query()
            ->where('source_channel', 'whatsapp')
            ->when(! $isAdmin, fn ($qq) => $qq->where('user_id', $user?->id))
            ->with('project:id,name')
            ->orderByDesc('id')
            ->limit(self::FILED_PER_LIST)
            ->get()
            ->map(fn (Expense $e) => [
                'id' => $e->id,
                'title' => $e->title,
                'amount' => $e->amount,
                'currency' => $e->currency ?? 'KES',
                'status' => $e->status,
                'confidence' => $e->confidence,
                'reference_number' => $e->reference_number,
                'project_name' => $e->project?->name,
                'created_at' => $e->created_at?->toIso8601String(),
                'url' => route('expenses.show', $e->id),
            ]);

        $filedPhotos = Photo::query()
            ->where('source_channel', 'whatsapp')
            ->when(! $isAdmin, fn ($qq) => $qq->where('user_id', $user?->id))
            ->with('project:id,name')
            ->orderByDesc('id')
            ->limit(self::FILED_PER_LIST)
            ->get()
            ->map(fn (Photo $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'project_name' => $p->project?->name,
                'created_at' => $p->created_at?->toIso8601String(),
                'url' => route('photos.show', $p->id),
            ]);

        $counts = [
            'inbound' => WhatsAppLog::query()
                ->when(! $isAdmin, fn ($qq) => $qq->where('user_id', $user?->id))
                ->where('direction', 'inbound')->count(),
            'outbound' => WhatsAppLog::query()
                ->when(! $isAdmin, fn ($qq) => $qq->where('user_id', $user?->id))
                ->where('direction', 'outbound')->count(),
            'failed' => WhatsAppLog::query()
                ->when(! $isAdmin, fn ($qq) => $qq->where('user_id', $user?->id))
                ->where('status', 'failed')->count(),
        ];

        return Inertia::render('WhatsApp/Activity', [
            'isAdmin' => $isAdmin,
            'filters' => [
                'direction' => $direction ?: 'all',
                'status' => $status ?: 'all',
                'q' => $q,
            ],
            'items' => $items,
            'filed' => [
                'expenses' => $filedExpenses,
                'photos' => $filedPhotos,
            ],
            'counts' => $counts,
            'settingsUrl' => $isAdmin ? route('whatsapp.settings') : null,
        ]);
    }

    /**
     * Turn the polymorphic filed relation into a small array the timeline can
     * render as "→ Created Expense #47". Returns null when the log has no
     * linked record (legacy inbound rows, or outbound replies).
     */
    private function serializeFiled(WhatsAppLog $log): ?array
    {
        $model = $log->filed;
        if (! $model) {
            return null;
        }

        return match (true) {
            $model instanceof Expense => [
                'kind' => 'expense',
                'id' => $model->id,
                'label' => 'Expense #'.$model->id.' — '.($model->currency ?? 'KES').' '.number_format((float) $model->amount, 2),
                'url' => route('expenses.show', $model->id),
            ],
            $model instanceof Photo => [
                'kind' => 'photo',
                'id' => $model->id,
                'label' => 'Photo #'.$model->id.($model->title ? ' — '.$model->title : ''),
                'url' => route('photos.show', $model->id),
            ],
            default => null,
        };
    }
}
