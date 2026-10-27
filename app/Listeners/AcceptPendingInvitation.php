<?php

namespace App\Listeners;

use App\Models\ProjectInvitation;
use App\Models\User;
use App\Services\ProjectInvitations;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Illuminate\Validation\ValidationException;

/**
 * A guest who opened an invitation link signs in or signs up; join them to
 * the project now. Covers every way in (password, login code, passkey,
 * registration) because they all fire Login or Registered.
 */
class AcceptPendingInvitation
{
    public function __construct(private ProjectInvitations $invitations) {}

    public function handle(Login|Registered $event): void
    {
        $session = request()->hasSession() ? request()->session() : null;
        $pending = $session?->pull(ProjectInvitations::SESSION_KEY);
        if (! $pending || ! $event->user instanceof User) {
            return;
        }

        $invitation = ProjectInvitation::find($pending['id'] ?? null);
        if (! $invitation || ! $invitation->matchesToken($pending['token'] ?? null)) {
            return;
        }

        try {
            $project = $this->invitations->accept($invitation, $event->user);
            $session->flash('success', sprintf('You joined "%s"', $project->name));
        } catch (ValidationException $e) {
            $session->flash('error', collect($e->errors())->flatten()->first());
        }
    }
}
