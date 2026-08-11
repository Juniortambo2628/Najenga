<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

trait RespondsWithModel
{
    /**
     * Return a JSON response for API consumers or redirect back for Inertia requests.
     */
    protected function respondWithModel($model, string $successMessage): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $successMessage,
            'data' => $model,
        ]);
    }

    /**
     * Return a redirect response for Inertia or JSON for API requests.
     */
    protected function respondOrRedirect(Request $request, string $url, string $successMessage)
    {
        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'message' => $successMessage]);
        }

        return redirect()->back()->with('success', $successMessage);
    }
}
