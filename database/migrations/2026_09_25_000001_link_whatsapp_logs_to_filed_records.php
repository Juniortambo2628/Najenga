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
        if (Schema::hasTable('whatsapp_logs') && ! Schema::hasColumn('whatsapp_logs', 'filed_type')) {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->string('filed_type')->nullable()->after('message_id');
                $table->unsignedBigInteger('filed_id')->nullable()->after('filed_type');
            });
        }

        if (Schema::hasTable('whatsapp_logs') && ! Schema::hasIndex('whatsapp_logs', ['filed_type', 'filed_id'])) {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->index(['filed_type', 'filed_id']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasIndex('whatsapp_logs', ['filed_type', 'filed_id'])) {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->dropIndex(['filed_type', 'filed_id']);
            });
        }

        if (Schema::hasColumn('whatsapp_logs', 'filed_type')) {
            Schema::table('whatsapp_logs', function (Blueprint $table) {
                $table->dropColumn(['filed_type', 'filed_id']);
            });
        }
    }
};
