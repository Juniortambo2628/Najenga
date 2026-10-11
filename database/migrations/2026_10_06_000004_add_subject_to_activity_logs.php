<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 3.5: activity_logs was written without a subject, so every row was a
 * bare verb attached to a user. These columns let a log row point at the thing
 * that changed, which is what the per-expense Activity tab filters on.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('activity_logs', 'subject_type')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->string('subject_type', 100)->nullable()->after('action');
                $table->unsignedBigInteger('subject_id')->nullable()->after('subject_type');
            });
        }

        if (! Schema::hasIndex('activity_logs', ['subject_type', 'subject_id'])) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->index(['subject_type', 'subject_id']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasIndex('activity_logs', ['subject_type', 'subject_id'])) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->dropIndex(['subject_type', 'subject_id']);
            });
        }

        if (Schema::hasColumn('activity_logs', 'subject_type')) {
            Schema::table('activity_logs', function (Blueprint $table) {
                $table->dropColumn(['subject_type', 'subject_id']);
            });
        }
    }
};
