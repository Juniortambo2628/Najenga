<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * One place decides what a mutation returns.
 *
 * Two kinds of caller hit the same URL:
 *
 *   - axios sends `Accept: application/json` and wants a JSON body;
 *   - Inertia (router.post/patch/delete) sends `X-Inertia: true` and wants a
 *     302 back to where the user came from, so the flash toast fires.
 *
 * `wantsJson() && !X-Inertia` is what tells them apart, so every endpoint
 * reachable both ways returns through one of these two methods instead of
 * repeating the condition.
 *
 * There is no $url argument: every controller in this app redirects back to
 * the referrer (`redirect()->back()`), and the message alone drives the flash.
 */
trait RespondsWithModel
{
    /**
     * JSON when the caller asked for JSON, redirect back otherwise.
     *
     * @param  JsonResponse|null  $json  exact body for JSON callers; defaults to
     *                                   {success, message} when the caller does not
     *                                   need anything else.
     */
    protected function respondOrRedirect(Request $request, string $successMessage, ?JsonResponse $json = null): Response
    {
        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return $json ?? response()->json(['success' => true, 'message' => $successMessage]);
        }

        return redirect()->back()->with('success', $successMessage);
    }

    /**
     * Same split, but the redirect carries an error flash.
     *
     * @param  JsonResponse|null  $json  exact body for JSON callers; defaults to
     *                                   {message} with a 400.
     */
    protected function respondErrorOrRedirect(Request $request, string $errorMessage, ?JsonResponse $json = null): Response
    {
        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return $json ?? response()->json(['message' => $errorMessage], 400);
        }

        return redirect()->back()->with('error', $errorMessage);
    }
}
