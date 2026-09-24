<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WhatsAppWeeklyDigest extends Notification
{
    use Queueable;

    /**
     * @param  array{inbound:int,outbound:int,failed:int,filed_expenses:int,drafts:int,photos:int,top_project:?string,since:string,until:string}  $stats
     */
    public function __construct(private readonly array $stats)
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
        $s = $this->stats;
        $activityUrl = url('/whatsapp');
        $draftsHint = $s['drafts'] > 0
            ? "You have **{$s['drafts']} draft{$this->s($s['drafts'])}** waiting for your review."
            : 'No drafts waiting for you — nice.';

        return (new MailMessage())
            ->subject(config('app.name').' — your WhatsApp week')
            ->greeting('Hi '.($notifiable->first_name ?: $notifiable->username).',')
            ->line("Here's what came through WhatsApp between {$s['since']} and {$s['until']}.")
            ->line("- **{$s['inbound']}** message{$this->s($s['inbound'])} received")
            ->line("- **{$s['filed_expenses']}** expense{$this->s($s['filed_expenses'])} auto-filed")
            ->line("- **{$s['photos']}** photo{$this->s($s['photos'])} filed to projects")
            ->when($s['failed'] > 0, fn ($m) => $m->line("- **{$s['failed']}** message{$this->s($s['failed'])} failed to deliver"))
            ->when($s['top_project'], fn ($m) => $m->line("Most activity: **{$s['top_project']}**."))
            ->line($draftsHint)
            ->action('Open WhatsApp activity', $activityUrl);
    }

    private function s(int $n): string
    {
        return $n === 1 ? '' : 's';
    }
}
