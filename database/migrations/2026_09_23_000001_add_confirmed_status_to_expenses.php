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
        if (Schema::hasTable('expenses')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->enum('status', ['draft', 'pending', 'confirmed', 'approved', 'rejected', 'paid'])->default('draft')->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('expenses')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'paid'])->default('draft')->change();
            });
        }
    }
};
