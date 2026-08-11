<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->index('project_id');
        });

        Schema::table('photos', function (Blueprint $table) {
            $table->index('project_id');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->index('project_id');
        });

        Schema::table('project_user', function (Blueprint $table) {
            $table->index('project_id');
            $table->index('user_id');
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->index('project_id');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index('conversation_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
        });

        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
        });

        Schema::table('project_user', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['conversation_id']);
            $table->dropIndex(['user_id']);
        });
    }
};
