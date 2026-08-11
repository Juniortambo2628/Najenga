<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('expenses')) {
            DB::statement("ALTER TABLE expenses MODIFY COLUMN status ENUM('pending','approved','rejected','paid') DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('expenses')) {
            DB::statement("ALTER TABLE expenses MODIFY COLUMN status ENUM('pending','approved','rejected') DEFAULT 'pending'");
        }
    }
};
