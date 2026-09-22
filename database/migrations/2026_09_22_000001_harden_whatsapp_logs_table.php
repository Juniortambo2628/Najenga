<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Meta retries webhook deliveries, so the same wamid may already have
        // been logged more than once. Keep the earliest row for each message
        // so the unique index below can be created.
        $keep = DB::table('whatsapp_logs')
            ->whereNotNull('message_id')
            ->groupBy('message_id')
            ->havingRaw('COUNT(*) > 1')
            ->selectRaw('MIN(id) as id, message_id')
            ->get();

        foreach ($keep as $row) {
            DB::table('whatsapp_logs')
                ->where('message_id', $row->message_id)
                ->where('id', '!=', $row->id)
                ->delete();
        }

        Schema::table('whatsapp_logs', function (Blueprint $table) {
            // The enum had no room for Meta's delivery states ('delivered') or
            // the job's own 'queued', so inserts failed under strict SQL.
            $table->string('status', 20)->default('sent')->change();
            $table->text('error_message')->nullable()->after('status');
            $table->unique('message_id');
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_logs', function (Blueprint $table) {
            $table->dropUnique(['message_id']);
            $table->dropColumn('error_message');
        });
    }
};
