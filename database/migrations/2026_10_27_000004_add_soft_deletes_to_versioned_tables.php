<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 13.3: deleted records can be restored.
 *
 * Adds deleted_at to the six versioned tables. Nothing changes until the
 * models use SoftDeletes; then a delete sets deleted_at, lists skip those
 * rows, and media files of trashed rows are purged after 30 days.
 */
return new class extends Migration
{
    private array $tables = ['projects', 'expenses', 'receipts', 'documents', 'photos', 'project_timelines'];

    public function up(): void
    {
        foreach ($this->tables as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->softDeletes();
                $table->index('deleted_at');
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $name) {
            Schema::table($name, function (Blueprint $table) {
                $table->dropIndex(['deleted_at']);
                $table->dropSoftDeletes();
            });
        }
    }
};
