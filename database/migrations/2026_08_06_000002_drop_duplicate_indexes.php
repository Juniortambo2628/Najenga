<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (config('database.default') !== 'mysql') {
            return;
        }

        $tables = ['expenses', 'photos', 'documents', 'project_user', 'messages'];

        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            $foreignKeys = DB::select(
                "SELECT CONSTRAINT_NAME, COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL",
                [$table]
            );

            foreach ($foreignKeys as $fk) {
                $indexName = "{$table}_{$fk->COLUMN_NAME}_index";
                if (Schema::hasIndex($table, $indexName)) {
                    DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
                    Schema::table($table, fn ($t) => $t->dropIndex($indexName));
                    $refTable = match ($fk->COLUMN_NAME) {
                        'project_id' => 'projects',
                        'user_id' => 'users',
                        'conversation_id' => 'conversations',
                        default => null,
                    };
                    if ($refTable === null) {
                        continue;
                    }
                    Schema::table($table, function ($t) use ($fk, $refTable) {
                        $t->foreign($fk->COLUMN_NAME)->references('id')->on($refTable)->onDelete('cascade');
                    });
                }
            }
        }
    }

    public function down(): void
    {
        $indexes = [
            'expenses' => ['project_id'],
            'photos' => ['project_id'],
            'documents' => ['project_id'],
            'project_user' => ['project_id', 'user_id'],
            'messages' => ['conversation_id', 'user_id'],
        ];

        foreach ($indexes as $table => $columns) {
            foreach ($columns as $column) {
                if (! Schema::hasIndex($table, "{$table}_{$column}_index")) {
                    Schema::table($table, fn ($t) => $t->index($column));
                }
            }
        }
    }
};
