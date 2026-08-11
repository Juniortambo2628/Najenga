<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Intentionally empty.
        // FK constraints (->constrained()) already create implicit indexes
        // on the referencing columns. Explicit duplicate indexes are not needed.
    }

    public function down(): void
    {
        //
    }
};
