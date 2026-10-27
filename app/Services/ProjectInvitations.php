<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\ProjectInvitationNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Adding people to a project: straight away when they have an account,
 * otherwise by an emailed invitation they accept after signing up.
 */
class ProjectInvitations
{
    /** Session key holding an invitation a guest opened, until they sign in or up. */
    public const SESSION_KEY = 'project_invitation';

    /**
     * @return array{status: 'added'|'invited', user?: User, invitation?: ProjectInvitation}
     */
    public function invite(Project $project, string $email, string $role, User $by): array
    {
        $email = Str::lower(trim($email));
        $existing = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if ($existing) {
            if ($project->roleFor($existing) !== null) {
                throw ValidationException::withMessages(['email' => 'This person is already in the project.']);
            }

            $project->users()->attach($existing->id, [
                'role' => $role,
                'invited_by' => $by->id,
                'invited_at' => now(),
                'accepted_at' => now(),
            ]);
            ActivityLogger::log('project.member_added', sprintf('Added %s to "%s" as %s', $existing->email, $project->name, $role), $project);

            return ['status' => 'added', 'user' => $existing];
        }

        // One open invitation per address: inviting again refreshes it.
        $invitation = ProjectInvitation::pending()
            ->where('project_id', $project->id)
            ->where('email', $email)
            ->first()
            ?? new ProjectInvitation(['project_id' => $project->id, 'email' => $email]);

        $invitation->fill(['role' => $role, 'invited_by' => $by->id]);
        $this->send($invitation);
        ActivityLogger::log('project.invited', sprintf('Invited %s to "%s" as %s', $email, $project->name, $role), $project);

        return ['status' => 'invited', 'invitation' => $invitation];
    }

    /** A fresh link (and expiry), emailed again. */
    public function resend(ProjectInvitation $invitation): void
    {
        $this->send($invitation);
    }

    public function revoke(ProjectInvitation $invitation): void
    {
        $invitation->forceFill(['revoked_at' => now()])->save();
        ActivityLogger::log('project.invitation_revoked', sprintf('Revoked the invitation for %s', $invitation->email), $invitation->project);
    }

    /**
     * Join the invitation's project as `$user`. The account's email must be
     * the one the invitation went to; opening the emailed link proves it, so
     * an unverified address becomes verified.
     *
     * @throws ValidationException when the invitation can't be used by this user
     */
    public function accept(ProjectInvitation $invitation, User $user): Project
    {
        if (! $invitation->isPending()) {
            throw ValidationException::withMessages(['invitation' => 'This invitation has expired or is no longer valid.']);
        }
        if (! $invitation->emailMatches($user)) {
            throw ValidationException::withMessages(['invitation' => sprintf('This invitation was sent to %s. Sign in with that address to accept it.', $invitation->email)]);
        }

        $project = $invitation->project;

        DB::transaction(function () use ($invitation, $user, $project) {
            if ($project->roleFor($user) === null) {
                $project->users()->attach($user->id, [
                    'role' => $invitation->role,
                    'invited_by' => $invitation->invited_by,
                    'invited_at' => $invitation->created_at,
                    'accepted_at' => now(),
                ]);
            }

            $invitation->forceFill(['accepted_at' => now(), 'accepted_by' => $user->id])->save();

            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }
        });

        ActivityLogger::logFor($user, 'project.joined', sprintf('%s joined "%s" as %s', $user->email, $project->name, $invitation->role), $project);

        return $project;
    }

    private function send(ProjectInvitation $invitation): void
    {
        $token = $invitation->refreshToken();
        $invitation->load('project', 'inviter');

        Notification::route('mail', $invitation->email)
            ->notify(new ProjectInvitationNotification($invitation, $invitation->acceptUrl($token)));
    }
}
