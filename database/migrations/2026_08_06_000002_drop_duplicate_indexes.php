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
                    Schema::table($table, function ($t) use ($fk) {
                        $refTable = match ($fk->COLUMN_NAME) {
                            'project_id' => 'projects',
                            'user_id' => 'users',
                            'conversation_id' => 'conversations',
                        };
                        $t->foreign($fk->COLUMN_NAME)->references('id')->on($refTable)->onDelete('cascade');
                    });
                }
            }
        }
    }

    public function down(): void
    {
        Schema::table('expenses', function ($table) {
            $table->index('project_id');
        });
        Schema::table('photos', function ($table) {
            $table->index('project_id');
        });
        Schema::table('documents', function ($table) {
            $table->index('project_id');
        });
        Schema::table('project_user', function ($table) {
            $table->index('project_id');
            $table->index('user_id');
        });
        Schema::table('messages', function ($table) {
            $table->index('conversation_id');
            $table->index('user_id');
        });
    }
};
