<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The WhatsApp activity page used to hunt down filed items with a title
 * prefix and a source_channel filter across two tables. Give each log row
 * a direct polymorphic pointer at what it produced (Expense / Photo), and
 * add source_channel to photos so we no longer key off the title.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('whatsapp_logs', 'filed_type')) {
                $table->string('filed_type')->nullable()->after('message_id');
            }
            if (! Schema::hasColumn('whatsapp_logs', 'filed_id')) {
                $table->unsignedBigInteger('filed_id')->nullable()->after('filed_type');
                $table->index(['filed_type', 'filed_id']);
            }
        });

        Schema::table('photos', function (Blueprint $table) {
            if (! Schema::hasColumn('photos', 'source_channel')) {
                $table->string('source_channel', 32)->nullable()->after('category');
                $table->index('source_channel');
            }
        });

        // Backfill: photos the ProcessWhatsAppMedia job stamped with a
        // "WhatsApp photo/video — <date>" title were WhatsApp inbound.
        DB::table('photos')
            ->where('title', 'like', 'WhatsApp %')
            ->update(['source_channel' => 'whatsapp']);
    }

    public function down(): void
    {
        Schema::table('whatsapp_logs', function (Blueprint $table) {
            if (Schema::hasColumn('whatsapp_logs', 'filed_id')) {
                $table->dropIndex(['filed_type', 'filed_id']);
                $table->dropColumn('filed_id');
            }
            if (Schema::hasColumn('whatsapp_logs', 'filed_type')) {
                $table->dropColumn('filed_type');
            }
        });

        Schema::table('photos', function (Blueprint $table) {
            if (Schema::hasColumn('photos', 'source_channel')) {
                $table->dropIndex(['source_channel']);
                $table->dropColumn('source_channel');
            }
        });
    }
};
