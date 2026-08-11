<?php

namespace App\Traits;

use App\Models\Project;
use App\Notifications\NewActivityNotification;
use Illuminate\Support\Facades\Notification;

trait DispatchesActivityNotifications
{
    /**
     * Notify all project members (except the actor) about a new activity.
     */
    protected function notifyProjectMembers(Project $project, string $actorName, string $activityTitle, string $activityDescription): void
    {
        $recipients = $project->users()->where('users.id', '!=', auth()->id())->get();

        Notification::send($recipients, new NewActivityNotification([
            'title' => $activityTitle,
            'description' => $activityDescription,
            'actor' => $actorName,
            'project_id' => $project->id,
        ]));
    }
}
