<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Turns SQLite's foreign key checks back on once the migrations have run.
 *
 * 2025_01_01_000000 switches them off for the migrating connection (older
 * migrations rebuild tables, which SQLite can't do with them on). Without
 * this, that connection stayed unchecked afterwards, which in the test suite
 * (one in-memory connection) meant no foreign key was ever enforced there,
 * while production's MySQL enforces every one. Migrations added after this
 * one run with the checks on, as they do on MySQL.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::connection()->getPdo()->exec('PRAGMA foreign_keys = ON');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::connection()->getPdo()->exec('PRAGMA foreign_keys = OFF');
        }
    }
};
