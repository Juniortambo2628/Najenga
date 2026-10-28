<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * When the person finished (or skipped) the dashboard tour, so it follows
 * the account across browsers and devices instead of one browser's storage.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'tour_completed_at')) {
            Schema::table('users', fn (Blueprint $table) => $table->timestamp('tour_completed_at')->nullable());
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'tour_completed_at')) {
            Schema::table('users', fn (Blueprint $table) => $table->dropColumn('tour_completed_at'));
        }
    }
};
