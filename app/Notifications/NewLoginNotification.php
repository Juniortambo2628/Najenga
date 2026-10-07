<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class NewLoginNotification extends Notification
{
    use Queueable;

    public function __construct(public array $context)
    {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New sign-in to your ' . config('app.name') . ' account')
            ->line('Your account was just signed in from a device or location we have not seen before.')
            ->line('IP address: ' . ($this->context['ip'] ?? 'unknown'))
            ->line('Device: ' . Str::limit($this->context['user_agent'] ?? 'unknown', 120))
            ->line('Time: ' . now()->toDateTimeString())
            ->line('If this was not you, change your password immediately.');
    }
}
