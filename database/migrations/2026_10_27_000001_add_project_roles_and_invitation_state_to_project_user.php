<?php

use App\Support\ForeignKeyColumn;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 12.2: per-project roles.
 *
 * project_user.role (string, default 'viewer') now holds one of
 * owner | manager | editor | viewer; the column itself is unchanged.
 * Who invited a member, and when the invitation went out and was accepted,
 * are new. Existing members joined straight away, so they count as accepted.
 *
 * Clients (owner) and assigned managers (manager) become member rows in the
 * migration that ships with the new Share panel (12.5), so the old share
 * modal never lists them.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Safe to run again: on production's first attempt MySQL added the
        // columns but refused the foreign key (users.id isn't BIGINT there),
        // and MySQL doesn't roll back schema changes. Each step checks first.
        if (! Schema::hasColumn('project_user', 'invited_by')) {
            Schema::table('project_user', function (Blueprint $table) {
                ForeignKeyColumn::add($table, 'invited_by', 'users')->nullable()->after('role');
            });
        } else {
            ForeignKeyColumn::align('project_user', 'invited_by', 'users');
        }

        foreach (['invited_at' => 'invited_by', 'accepted_at' => 'invited_at'] as $column => $after) {
            if (! Schema::hasColumn('project_user', $column)) {
                Schema::table('project_user', fn (Blueprint $table) => $table->timestamp($column)->nullable()->after($after));
            }
        }

        if (! ForeignKeyColumn::exists('project_user', 'invited_by')) {
            Schema::table('project_user', fn (Blueprint $table) => $table->foreign('invited_by')->references('id')->on('users')->nullOnDelete());
        }

        // Members added before invitations existed joined straight away.
        DB::table('project_user')->whereNull('accepted_at')->update(['accepted_at' => DB::raw('created_at')]);
    }

    public function down(): void
    {
        Schema::table('project_user', function (Blueprint $table) {
            $table->dropConstrainedForeignId('invited_by');
            $table->dropColumn(['invited_at', 'accepted_at']);
        });
    }
};
