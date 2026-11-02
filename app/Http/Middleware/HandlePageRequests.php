<?php

namespace App\Http\Middleware;

use App\Http\Page;
use App\Models\Project;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

/**
 * What every page of the app gets (App\Http\Page): who is signed in and
 * their projects, flash messages and validation errors. And the page
 * protocol's rules for the app's requests (X-Kit-Page): a redirect after a
 * PUT, PATCH or DELETE is a 303 (so the follow-up is a GET), and an empty
 * answer sends you back. (Replaces HandleInertiaRequests.)
 */
class HandlePageRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        Page::flushShared();
        Page::share($this->share($request));

        $response = $next($request);
        $response->headers->set('Vary', Page::HEADER);

        // Pages must be asked for again after a deploy, so the browser gets
        // the current build; the build's own files stay cacheable (their
        // names change with their contents).
        if ($request->isMethodCacheable()) {
            $response->headers->set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
        }

        if (! Page::requested($request)) {
            return $response;
        }

        if ($response->isOk() && empty($response->getContent())) {
            return Redirect::back();
        }

        if ($response->getStatusCode() === 302 && in_array($request->method(), ['PUT', 'PATCH', 'DELETE'], true)) {
            $response->setStatusCode(303);
        }

        return $response;
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $session = $request->hasSession() ? $request->session() : null;

        return [
            'errors' => fn () => $this->validationErrors($request),
            'auth' => [
                'user' => $request->user(),
                // Every project the user can see, with their role in it: the
                // header's project switcher and useRole() read this.
                'projects' => fn () => $request->user() ? $this->projectsFor($request->user()) : [],
            ],
            // Controllers ->with('success'|'error'|'status'): Components/FlashToast.jsx.
            'flash' => [
                'success' => $session?->get('success'),
                'error' => $session?->get('error'),
                'status' => $session?->get('status'),
            ],
        ];
    }

    /**
     * The first message for each field that failed validation on the last
     * request: { title: "The title field is required." }.
     */
    protected function validationErrors(Request $request): object
    {
        if (! $request->hasSession() || ! $request->session()->has('errors')) {
            return (object) [];
        }

        $bags = collect($request->session()->get('errors')->getBags())
            ->map(fn ($bag) => (object) collect($bag->messages())->map(fn ($errors) => $errors[0])->toArray());

        return $bags->has('default') ? $bags->get('default') : (object) $bags->toArray();
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
