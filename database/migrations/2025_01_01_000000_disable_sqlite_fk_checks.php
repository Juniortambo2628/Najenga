<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (config('database.default') === 'sqlite') {
            DB::connection()->getPdo()->exec('PRAGMA foreign_keys = OFF');
        }
    }

    public function down(): void
    {
        if (config('database.default') === 'sqlite') {
            DB::connection()->getPdo()->exec('PRAGMA foreign_keys = ON');
        }
    }
};
