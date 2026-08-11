<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->index('expense_id');
        });

        Schema::table('annotations', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('parent_id');
        });

        Schema::table('folders', function (Blueprint $table) {
            $table->index('project_id');
            $table->index('parent_id');
        });

        Schema::table('project_timelines', function (Blueprint $table) {
            $table->index('project_id');
        });

        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('whatsapp_logs', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('conversation_user', function (Blueprint $table) {
            $table->index('conversation_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropIndex(['expense_id']);
        });

        Schema::table('annotations', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['parent_id']);
        });

        Schema::table('folders', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
            $table->dropIndex(['parent_id']);
        });

        Schema::table('project_timelines', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
        });

        Schema::table('whatsapp_contacts', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('whatsapp_logs', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('conversation_user', function (Blueprint $table) {
            $table->dropIndex(['conversation_id']);
            $table->dropIndex(['user_id']);
        });
    }
};
