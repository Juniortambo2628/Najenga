<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoginCodeNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $code, private readonly int $ttlMinutes)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Your '.config('app.name').' sign-in code')
            ->greeting('Hi '.($notifiable->first_name ?: $notifiable->username).',')
            ->line('Use the code below to sign in. It expires in '.$this->ttlMinutes.' minutes.')
            ->line('**'.$this->code.'**')
            ->line('If you did not request this code, you can safely ignore this email — no one can sign in without it.');
    }
}
