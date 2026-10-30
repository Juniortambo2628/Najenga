<?php

namespace App\Notifications;

use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public ProjectInvitation $invitation, public string $url) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $project = $this->invitation->project;
        $inviter = $this->invitation->inviter;

        return (new MailMessage)
            ->subject(sprintf('Join "%s" on %s', $project->name, config('app.name')))
            ->line(sprintf(
                '%s invited you to the project "%s" as %s.',
                $inviter?->name ?? 'Someone',
                $project->name,
                match ($this->invitation->role) { 'viewer' => 'a viewer', 'owner' => 'a co-owner', default => 'an '.$this->invitation->role },
            ))
            ->action('Join the project', $this->url)
            ->line(sprintf('The link works for %d days. If you don\'t have an account yet, you can create one with this email address.', ProjectInvitation::VALID_DAYS))
            ->line('If you weren\'t expecting this, you can ignore this email.');
    }
}
