<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ENUM MODIFY is MySQL-specific syntax. SQLite (local `php artisan test`)
        // stores enums as TEXT with no CHECK constraint here, so it already
        // accepts any status — nothing to do.
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE expenses MODIFY COLUMN status ENUM('draft','pending','confirmed','approved','rejected','paid') DEFAULT 'draft'");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("UPDATE expenses SET status = 'approved' WHERE status = 'confirmed'");
        DB::statement("ALTER TABLE expenses MODIFY COLUMN status ENUM('draft','pending','approved','rejected','paid') DEFAULT 'draft'");
    }
};
