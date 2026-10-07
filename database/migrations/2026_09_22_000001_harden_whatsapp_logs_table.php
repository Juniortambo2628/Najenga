<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Reproduces the production migration of the same name (it was never committed to this repo).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('whatsapp_logs') && ! Schema::hasColumn('whatsapp_logs', 'error_message')) {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->text('error_message')->nullable()->after('status');
            });
        }

        $statusType = Schema::hasColumn('whatsapp_logs', 'status')
            ? strtolower(Schema::getColumnType('whatsapp_logs', 'status'))
            : '';

        if ($statusType === 'enum') {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->string('status', 20)->default('sent')->change();
            });
        }

        if (Schema::hasTable('whatsapp_logs') && ! Schema::hasIndex('whatsapp_logs', ['message_id'])) {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->unique('message_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasIndex('whatsapp_logs', 'whatsapp_logs_message_id_unique')) {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->dropUnique('whatsapp_logs_message_id_unique');
            });
        }

        $statusType = Schema::hasColumn('whatsapp_logs', 'status')
            ? strtolower(Schema::getColumnType('whatsapp_logs', 'status'))
            : '';

        if ($statusType === 'varchar') {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->enum('status', ['sent', 'received', 'read', 'failed'])->default('sent')->change();
            });
        }

        if (Schema::hasColumn('whatsapp_logs', 'error_message')) {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->dropColumn('error_message');
            });
        }
    }
};
