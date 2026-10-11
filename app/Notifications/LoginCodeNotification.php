<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoginCodeNotification extends Notification
{
    use Queueable;

    public function __construct(public string $code)
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
            ->subject('Your ' . config('app.name') . ' sign-in code')
            ->line('Here is the one-time code to sign in to your account:')
            ->line($this->code)
            ->line('It expires in 10 minutes and can only be used once.')
            ->line('If you did not request this, you can safely ignore this email.');
    }
}
