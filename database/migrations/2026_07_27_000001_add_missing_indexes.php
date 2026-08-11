<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // FK constraints (->constrained()) already create implicit indexes
        // on MySQL and SQLite. Only add indexes for columns that do NOT
        // have FK constraints.
        //
        // No-op: all referenced columns already have FK implicit indexes.
    }

    public function down(): void
    {
        //
    }
};
