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

        // On MySQL, add_missing_performance_indexes and add_missing_indexes
        // may have created explicit indexes that duplicate FK implicit indexes.
        // MySQL attaches the FK constraint to the explicit index, so we must
        // drop the FK first, drop the index, then re-add the FK.

        $fkDrops = [
            'expenses' => ['project_id' => 'expenses_project_id_foreign', 'user_id' => 'expenses_user_id_foreign'],
            'photos' => ['project_id' => 'photos_project_id_foreign', 'user_id' => 'photos_user_id_foreign'],
            'documents' => ['project_id' => 'documents_project_id_foreign', 'user_id' => 'documents_user_id_foreign'],
            'project_user' => ['project_id' => 'project_user_project_id_foreign', 'user_id' => 'project_user_user_id_foreign'],
            'messages' => ['conversation_id' => 'messages_conversation_id_foreign', 'user_id' => 'messages_user_id_foreign'],
        ];

        foreach ($fkDrops as $table => $columns) {
            foreach ($columns as $column => $fkName) {
                $indexName = "{$table}_{$column}_index";
                if (Schema::hasIndex($table, $indexName)) {
                    DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$fkName}`");
                    Schema::table($table, fn ($t) => $t->dropIndex($indexName));
                    Schema::table($table, function ($t) use ($column, $fkName) {
                        $refTable = match ($column) {
                            'project_id' => 'projects',
                            'user_id' => 'users',
                            'conversation_id' => 'conversations',
                        };
                        $t->foreign($column)->references('id')->on($refTable)->onDelete('cascade');
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
