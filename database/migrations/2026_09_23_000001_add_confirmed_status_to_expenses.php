<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reproduces the production migration of the same name (it was never committed to this repo).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('expenses')) {
            return;
        }

        // ENUM MODIFY is MySQL-specific syntax. SQLite stores enums as TEXT
        // with a CHECK constraint, so a schema change rebuilds the table with
        // the widened value list there.
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE expenses MODIFY COLUMN status ENUM('draft','pending','confirmed','approved','rejected','paid') DEFAULT 'draft'");

            return;
        }

        Schema::table('expenses', function (Blueprint $table) {
            $table->enum('status', ['draft', 'pending', 'confirmed', 'approved', 'rejected', 'paid'])->default('draft')->change();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('expenses')) {
            return;
        }

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("UPDATE expenses SET status = 'approved' WHERE status = 'confirmed'");
            DB::statement("ALTER TABLE expenses MODIFY COLUMN status ENUM('draft','pending','approved','rejected','paid') DEFAULT 'draft'");

            return;
        }

        Schema::table('expenses', function (Blueprint $table) {
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'paid'])->default('draft')->change();
        });
    }
};
