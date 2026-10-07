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
        if (Schema::hasTable('expenses') && ! Schema::hasColumn('expenses', 'payment_source')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->string('payment_source', 32)->nullable()->after('payment_method');
            });
        }

        if (Schema::hasTable('expenses') && ! Schema::hasColumn('expenses', 'confidence')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->decimal('confidence', 4, 3)->nullable()->after('status');
            });
        }

        if (Schema::hasTable('expenses') && ! Schema::hasColumn('expenses', 'source_channel')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->string('source_channel', 32)->nullable()->after('confidence');
            });
        }

        if (Schema::hasTable('photos') && ! Schema::hasColumn('photos', 'source_channel')) {
            Schema::table('photos', function (Blueprint $table) {
                $table->string('source_channel', 32)->nullable()->after('category');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('photos', 'source_channel')) {
            Schema::table('photos', function (Blueprint $table) {
                $table->dropColumn('source_channel');
            });
        }

        if (Schema::hasColumn('expenses', 'source_channel')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->dropColumn('source_channel');
            });
        }

        if (Schema::hasColumn('expenses', 'confidence')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->dropColumn('confidence');
            });
        }

        if (Schema::hasColumn('expenses', 'payment_source')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->dropColumn('payment_source');
            });
        }
    }
};
