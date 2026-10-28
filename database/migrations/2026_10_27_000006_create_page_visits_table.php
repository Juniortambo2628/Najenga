<?php

use App\Support\ForeignKeyColumn;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 14.3: when each person last opened each dashboard page (module), so the
 * sidebar can count changes others made since.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_visits', function (Blueprint $table) {
            $table->id();
            ForeignKeyColumn::add($table, 'user_id', 'users');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('module', 40);
            $table->timestamp('seen_at');

            $table->unique(['user_id', 'module']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_visits');
    }
};
