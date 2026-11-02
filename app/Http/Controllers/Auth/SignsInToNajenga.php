<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Every way of signing in (password, then any two-step code; an emailed
 * code) says where to go next: the page the person was sent away from, else
 * the dashboard.
 */
trait SignsInToNajenga
{
    protected function signIn(Request $request, Model $user, bool $remember = false): array
    {
        $home = route('dashboard', absolute: false);
        $next = $request->hasSession() ? $request->session()->pull('url.intended', $home) : $home;

        return parent::signIn($request, $user, $remember) + ['redirect' => $next];
    }
}
