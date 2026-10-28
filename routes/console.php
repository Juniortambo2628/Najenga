<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Expired login codes, versions older than Revision::KEEP_DAYS (180 days), and
// records 30 days in the trash, deleted for good with their files.
Schedule::command('model:prune', ['--model' => [
    \App\Models\LoginCode::class,
    \App\Models\Revision::class,
    \App\Models\Project::class,
    \App\Models\Expense::class,
    \App\Models\Receipt::class,
    \App\Models\Document::class,
    \App\Models\Photo::class,
    \App\Models\ProjectTimeline::class,
]])->daily();

// Weekly WhatsApp digest — Mondays at 08:00 UTC (11:00 EAT).
Schedule::command('whatsapp:send-weekly-digest')
    ->weeklyOn(1, '08:00')
    ->onOneServer()
    ->withoutOverlapping();
