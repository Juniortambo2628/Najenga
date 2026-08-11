<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // FK constraints already create implicit indexes on MySQL.
        // These explicit indexes are redundant and cause issues on MySQL
        // (can't drop an index used by a FK constraint).
        // Only drop indexes that don't have matching FK constraints.
        $duplicates = [
            'project_user' => ['project_user_project_id_index', 'project_user_user_id_index'],
            'messages' => ['messages_conversation_id_index', 'messages_user_id_index'],
        ];

        foreach ($duplicates as $table => $indexes) {
            foreach ($indexes as $index) {
                if (Schema::hasIndex($table, $index)) {
                    Schema::table($table, function ($table) use ($index) {
                        $table->dropIndex($index);
                    });
                }
            }
        }
    }

    public function down(): void
    {
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
