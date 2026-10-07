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
        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'whatsapp_verified_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('whatsapp_verified_at')->nullable()->after('whatsapp_wa_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'whatsapp_verified_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('whatsapp_verified_at');
            });
        }
    }
};
