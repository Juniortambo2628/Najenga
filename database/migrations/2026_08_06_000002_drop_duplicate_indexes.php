<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $duplicates = [
            'expenses' => ['expenses_project_id_index'],
            'photos' => ['photos_project_id_index'],
            'documents' => ['documents_project_id_index'],
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
