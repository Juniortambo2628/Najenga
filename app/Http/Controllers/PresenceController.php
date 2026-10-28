<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Who is online: each open tab sends a heartbeat every 20 seconds (paused
 * while hidden) and on every page change; the answer lists the people who
 * share a project with you and were seen in the last minute, and where.
 */
class PresenceController extends Controller
{
    /** Seen within this many seconds counts as online. */
    public const ONLINE_SECONDS = 60;

    public function heartbeat(Request $request): JsonResponse
    {
        $validated = $request->validate(['page' => ['required', 'string', 'max:191']]);
        $user = $request->user();

        // Only the path: no query strings (search terms) are kept.
        $path = '/'.trim((string) parse_url($validated['page'], PHP_URL_PATH), '/');
        $user->forceFill(['seen_at' => now(), 'current_page' => $path])->saveQuietly();

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

        return response()->json(['online' => $online->values()]);
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
