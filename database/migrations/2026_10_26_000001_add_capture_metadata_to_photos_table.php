<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * When a photo was taken, and how we know.
 *
 * taken_at is site-local wall-clock time (config('photos.local_timezone')),
 * not UTC: WhatsApp filenames carry local time, and converting would push
 * late-evening shots onto the next day in photo_date.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dateTime('taken_at')->nullable()->after('photo_date');
            $table->string('date_source', 20)->nullable()->after('taken_at');
            $table->string('source_path', 500)->nullable()->after('date_source');
            $table->char('content_hash', 64)->nullable()->after('source_path');

            $table->index('taken_at');
            $table->index(['project_id', 'content_hash']);
        });
    }

    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'content_hash']);
            $table->dropIndex(['taken_at']);
            $table->dropColumn(['taken_at', 'date_source', 'source_path', 'content_hash']);
        });
    }
};
