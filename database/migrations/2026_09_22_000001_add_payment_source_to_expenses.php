<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            if (! Schema::hasColumn('expenses', 'payment_source')) {
                $table->string('payment_source', 32)->nullable()->after('payment_method');
            }
            if (! Schema::hasColumn('expenses', 'confidence')) {
                $table->decimal('confidence', 4, 3)->nullable()->after('status');
            }
            if (! Schema::hasColumn('expenses', 'source_channel')) {
                $table->string('source_channel', 32)->nullable()->after('confidence');
            }
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            foreach (['payment_source', 'confidence', 'source_channel'] as $col) {
                if (Schema::hasColumn('expenses', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
