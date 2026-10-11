<?php

namespace App\Console\Commands;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\User;
use App\Models\WhatsAppLog;
use App\Notifications\WhatsAppWeeklyDigest;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendWhatsAppWeeklyDigest extends Command
{
    protected $signature = 'whatsapp:send-weekly-digest {--dry : Print the recipient count without sending}';
    protected $description = 'Email each linked user a summary of their WhatsApp activity from the past 7 days';

    public function handle(): int
    {
        $since = Carbon::now()->subDays(7);
        $until = Carbon::now();

        // Only users who actually had inbound WhatsApp activity in the window
        // get an email — no one wants a "you did nothing this week" digest.
        $userIds = WhatsAppLog::query()
            ->where('direction', 'inbound')
            ->where('timestamp', '>=', $since)
            ->whereNotNull('user_id')
            ->pluck('user_id')
            ->unique();

        $sent = 0;
        foreach ($userIds as $id) {
            $user = User::find($id);
            if (! $user || ! $user->email) {
                continue;
            }

            $stats = $this->statsFor($id, $since, $until);
            if ($this->option('dry')) {
                $this->line("Would send to {$user->email}: ".json_encode($stats));
                $sent++;
                continue;
            }

            $user->notify(new WhatsAppWeeklyDigest($stats));
            $sent++;
        }

        $this->info("Weekly WhatsApp digest: {$sent} user(s) notified.");

        return self::SUCCESS;
    }

    /**
     * @return array{inbound:int,outbound:int,failed:int,filed_expenses:int,drafts:int,photos:int,top_project:?string,since:string,until:string}
     */
    private function statsFor(int $userId, Carbon $since, Carbon $until): array
    {
        $inbound = WhatsAppLog::where('user_id', $userId)
            ->where('direction', 'inbound')
            ->where('timestamp', '>=', $since)
            ->count();

        $outbound = WhatsAppLog::where('user_id', $userId)
            ->where('direction', 'outbound')
            ->where('timestamp', '>=', $since)
            ->count();

        $failed = WhatsAppLog::where('user_id', $userId)
            ->where('status', 'failed')
            ->where('timestamp', '>=', $since)
            ->count();

        $expenses = Expense::where('user_id', $userId)
            ->where('source_channel', 'whatsapp')
            ->where('created_at', '>=', $since)
            ->get(['status', 'project_id']);

        $filedExpenses = $expenses->where('status', 'confirmed')->count();
        $drafts = $expenses->where('status', 'draft')->count();

        $photos = Photo::where('user_id', $userId)
            ->where('source_channel', 'whatsapp')
            ->where('created_at', '>=', $since)
            ->count();

        $topProjectId = $expenses->groupBy('project_id')->map->count()->sortDesc()->keys()->first();
        $topProjectName = $topProjectId
            ? \App\Models\Project::whereKey($topProjectId)->value('name')
            : null;

        return [
            'inbound' => $inbound,
            'outbound' => $outbound,
            'failed' => $failed,
            'filed_expenses' => $filedExpenses,
            'drafts' => $drafts,
            'photos' => $photos,
            'top_project' => $topProjectName,
            'since' => $since->toDateString(),
            'until' => $until->toDateString(),
        ];
    }
}
