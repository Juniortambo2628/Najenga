<?php

namespace App\Http\Middleware;

use App\Models\Project;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Dynamic pages must be re-requested after a deployment so the browser
     * receives the current Vite manifest and Inertia asset version. Built
     * assets remain cacheable because Vite fingerprints their filenames.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = parent::handle($request, $next);

        if ($request->isMethodCacheable()) {
            $response->headers->set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
        }

        return $response;
    }

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $session = $request->hasSession() ? $request->session() : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                // Every project the user can see, with their role in it: the
                // navbar project switcher and useRole() read this.
                'projects' => fn () => $request->user() ? $this->projectsFor($request->user()) : [],
            ],
            // 24 controllers call ->with('success'|...)-> with no consumer until
            // this was added - see Components/FlashToast.jsx.
            'flash' => [
                'success' => $session?->get('success'),
                'error' => $session?->get('error'),
                'status' => $session?->get('status'),
            ],
        ];
    }

    /**
     * @return array<int, array{id: int, name: string, role: string}>
     */
    private function projectsFor(User $user): array
    {
        $roles = Project::rolesFor($user);

        return Project::whereIn('id', array_keys($roles))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'role' => $roles[$project->id],
            ])
            ->all();
    }
}
