<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE expenses MODIFY COLUMN status ENUM('draft','pending','confirmed','approved','rejected','paid') DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("UPDATE expenses SET status = 'approved' WHERE status = 'confirmed'");
        DB::statement("ALTER TABLE expenses MODIFY COLUMN status ENUM('draft','pending','approved','rejected','paid') DEFAULT 'draft'");
    }
};
