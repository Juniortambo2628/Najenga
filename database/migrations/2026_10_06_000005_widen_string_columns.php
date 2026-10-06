<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 3.6 (flag 3.6, decided): users.email 100 -> 191, and the two name
 * columns 50 -> 191, so a 191-character address from a provider stops being
 * truncated; projects.name 100 -> 191 for the same reason. 191 keeps the
 * unique index on email within MyISAM's key limit under utf8mb4 (191 * 4 = 764
 * bytes). Modifiers are restated because MySQL's MODIFY replaces the whole
 * column definition.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email', 191)->nullable(false)->change();
            $table->string('first_name', 191)->nullable(false)->change();
            $table->string('last_name', 191)->nullable(false)->change();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('name', 191)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email', 100)->nullable(false)->change();
            $table->string('first_name', 50)->nullable(false)->change();
            $table->string('last_name', 50)->nullable(false)->change();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('name', 100)->nullable(false)->change();
        });
    }
};
