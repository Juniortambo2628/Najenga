<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Weekly WhatsApp digest — Mondays at 08:00 UTC (11:00 EAT).
Schedule::command('whatsapp:send-weekly-digest')
    ->weeklyOn(1, '08:00')
    ->onOneServer()
    ->withoutOverlapping();
