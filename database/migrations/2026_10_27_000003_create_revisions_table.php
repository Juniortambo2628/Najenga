<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 13.1: version history.
 *
 * One row per version of a record (projects, expenses, receipts, documents,
 * photos, timeline milestones): the record's fields before and after the
 * change, so any version can be restored. Rapid edits by one person to one
 * record within 10 minutes update the same row; rows older than 180 days are
 * pruned. Files are not versioned, only their metadata.
 *
 * changed: the field names that differ, for listing without decoding before/after.
 * batch:   groups the versions one request wrote (e.g. a bulk delete).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revisions', function (Blueprint $table) {
            $table->id();
            $table->morphs('revisionable');
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event', 16); // created | updated | deleted | restored
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->json('changed')->nullable();
            $table->uuid('batch')->nullable()->index();
            $table->timestamps();

            $table->index(['project_id', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revisions');
    }
};
