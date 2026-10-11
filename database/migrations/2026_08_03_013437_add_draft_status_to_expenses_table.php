<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'paid'])->default('draft')->change();
        });
    }

    public function down(): void
    {
        if (DB::table('expenses')->where('status', 'draft')->exists()) {
            return;
        }

        Schema::table('expenses', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected', 'paid'])->default('pending')->change();
        });
    }
};
