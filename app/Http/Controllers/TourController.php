<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * The dashboard tour: finishing or skipping it is remembered on the account,
 * so it doesn't start again on another browser or device.
 */
class TourController extends Controller
{
    public function complete(Request $request): Response
    {
        $user = $request->user();
        if (! $user->tour_completed_at) {
            $user->forceFill(['tour_completed_at' => now()])->saveQuietly();
        }

        return response()->noContent();
    }
}
