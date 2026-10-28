<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewActivityNotification extends Notification
{
    use Queueable;

    public $title;
    public $body;
    public $actionUrl;
    public $type;
    public $user;

    /**
     * Create a new notification instance.
     */
    public function __construct(array|string $title, ?string $body = null, ?string $actionUrl = null, ?string $type = null, $user = null)
    {
        if (is_array($title)) {
            $this->title = $title['title'] ?? null;
            $this->body = $title['description'] ?? null;
            $this->actionUrl = isset($title['project_id']) ? "/projects/{$title['project_id']}" : null;
            $this->type = $title['type'] ?? 'activity';
            $this->user = $title['actor'] ?? null;
        } else {
            $this->title = $title;
            $this->body = $body;
            $this->actionUrl = $actionUrl;
            $this->type = $type;
            $this->user = $user;
        }
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Off for people who turned activity notifications off in Settings.
        if ($notifiable instanceof \App\Models\User && ! $notifiable->preference('activity_notifications')) {
            return [];
        }

        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'action_url' => $this->actionUrl,
            'type' => $this->type,
            // The actor arrives as a User or, from notifyProjectMembers(), as a name.
            'user_name' => is_object($this->user) ? $this->user->name : $this->user,
            'user_avatar' => is_object($this->user) ? ($this->user->profile_photo_url ?? null) : null,
        ];
    }
}
