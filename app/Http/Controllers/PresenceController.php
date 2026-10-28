<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Revision;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Who is online: each open tab sends a heartbeat every 20 seconds (paused
 * while hidden) and on every page change; the answer lists the people who
 * share a project with you and were seen in the last minute, and where.
 */
class PresenceController extends Controller
{
    /** Seen within this many seconds counts as online. */
    public const ONLINE_SECONDS = 60;

    /** Sidebar pages with change badges, and the record type each lists. */
    public const MODULES = [
        'projects' => 'project',
        'expenses' => 'expense',
        'receipts' => 'receipt',
        'photos' => 'photo',
        'documents' => 'document',
        'timeline' => 'milestone',
    ];

    /** Pages never opened count changes from this many days back. */
    public const UNSEEN_DAYS = 7;

    public function heartbeat(Request $request): JsonResponse
    {
        $validated = $request->validate(['page' => ['required', 'string', 'max:191']]);
        $user = $request->user();

        // Only the path: no query strings (search terms) are kept.
        $path = '/'.trim((string) parse_url($validated['page'], PHP_URL_PATH), '/');
        $user->forceFill(['seen_at' => now(), 'current_page' => $path])->saveQuietly();

        // Opening a page with a badge marks its changes as seen.
        $section = explode('/', trim($path, '/'))[0] ?: 'dashboard';
        if (isset(self::MODULES[$section])) {
            DB::table('page_visits')->upsert(
                [['user_id' => $user->id, 'module' => $section, 'seen_at' => now()]],
                ['user_id', 'module'],
                ['seen_at'],
            );
        }

        $projectIds = Project::accessibleBy($user)->pluck('id');
        $visible = $projectIds->map(fn ($id) => (int) $id)->all();

        $online = User::query()
            ->whereKeyNot($user->id)
            ->where('seen_at', '>=', now()->subSeconds(self::ONLINE_SECONDS))
            ->where(fn ($q) => $q
                ->whereHas('projects', fn ($p) => $p->whereIn('projects.id', $projectIds))
                ->orWhereIn('id', Project::whereIn('id', $projectIds)->select('client_id')))
            ->with(['projects' => fn ($p) => $p->whereIn('projects.id', $projectIds)->select('projects.id')])
            ->orderBy('first_name')
            ->limit(50)
            ->get()
            ->map(fn (User $other) => [
                'id' => $other->id,
                'name' => $other->name,
                // The projects you share, for avatars on project cards.
                'projects' => $other->projects->pluck('id')
                    ->merge(Project::whereIn('id', $projectIds)->where('client_id', $other->id)->pluck('id'))
                    ->map(fn ($id) => (int) $id)->unique()->values()->all(),
            ] + self::where($other->current_page, $visible));

        return response()->json(['online' => $online->values(), 'badges' => self::badges($user)]);
    }

    /**
     * Per sidebar page: changes others made to what you can see since you
     * last opened that page (capped at 99).
     *
     * @return array<string, int>
     */
    private static function badges(User $user): array
    {
        $seen = DB::table('page_visits')->where('user_id', $user->id)->pluck('seen_at', 'module');
        $since = now()->subDays(self::UNSEEN_DAYS);

        $badges = [];
        foreach (self::MODULES as $module => $type) {
            $count = Revision::visibleTo($user)
                ->where('revisionable_type', (new (Revision::TYPES[$type]))->getMorphClass())
                ->where(fn ($q) => $q->whereNull('user_id')->orWhere('user_id', '!=', $user->id))
                ->where('updated_at', '>', $seen[$module] ?? $since)
                ->count();
            if ($count > 0) {
                $badges[$module] = min($count, 99);
            }
        }

        return $badges;
    }

    /**
     * Where someone is, as much as the viewer may know: the page ("expenses"),
     * and the project id only for a project the viewer can see too.
     */
    private static function where(?string $path, array $visibleProjectIds): array
    {
        $segments = array_values(array_filter(explode('/', (string) $path)));
        $where = ['page' => $segments[0] ?? 'dashboard', 'project_id' => null];

        if ($where['page'] === 'projects' && ctype_digit($segments[1] ?? '') && in_array((int) $segments[1], $visibleProjectIds, true)) {
            $where['project_id'] = (int) $segments[1];
        }

        return $where;
    }
}
