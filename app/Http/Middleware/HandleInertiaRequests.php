<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

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
}
