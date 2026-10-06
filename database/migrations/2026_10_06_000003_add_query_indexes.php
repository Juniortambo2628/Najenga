<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 3.3: the filters and sort keys the list pages query on, none of which
 * had an index. MySQL cannot express "IF NOT EXISTS" for indexes, so each one
 * is guarded with hasIndex() - the chain runs against a database that was
 * built from older migration sources (see docs/schema-drift.md).
 */
return new class extends Migration
{
    /**
     * @var array<string, array<int, string>>
     */
    private array $indexes = [
        'expenses' => ['category', 'status'],
        'photos' => ['category'],
        'users' => ['role', 'status'],
        'receipts' => ['verification_status'],
        'whatsapp_webhook_events' => ['processed', 'timestamp'],
    ];

    public function up(): void
    {
        foreach ($this->indexes as $table => $columns) {
            if (Schema::hasTable($table) && ! Schema::hasIndex($table, $columns)) {
                Schema::table($table, function (Blueprint $blueprint) use ($columns) {
                    $blueprint->index($columns);
                });
            }
        }
    }

    public function down(): void
    {
        foreach ($this->indexes as $table => $columns) {
            if (Schema::hasTable($table) && Schema::hasIndex($table, $columns)) {
                Schema::table($table, function (Blueprint $blueprint) use ($columns) {
                    $blueprint->dropIndex($columns);
                });
            }
        }
    }
};
