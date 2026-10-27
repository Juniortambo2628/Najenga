<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 14.1: who is online, and where.
 *
 * A heartbeat every 20 seconds (paused in hidden tabs) stamps seen_at and the
 * page the person is on; "online" means seen in the last minute.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('seen_at')->nullable()->index();
            $table->string('current_page', 191)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['seen_at']);
            $table->dropColumn(['seen_at', 'current_page']);
        });
    }
};
