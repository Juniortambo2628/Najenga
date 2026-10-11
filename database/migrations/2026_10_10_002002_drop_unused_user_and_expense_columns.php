<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'profile_image')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('profile_image');
            });
        }

        if (Schema::hasTable('expenses') && Schema::hasColumn('expenses', 'receipt_id')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->dropColumn('receipt_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'profile_image')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('profile_image')->nullable();
            });
        }

        if (Schema::hasTable('expenses') && ! Schema::hasColumn('expenses', 'receipt_id')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->string('receipt_id', 100)->nullable();
            });
        }
    }
};
