<?php

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
        Schema::table('project_user', function (Blueprint $table) {
            $table->foreignId('invited_by')->nullable()->after('role')->constrained('users')->nullOnDelete();
            $table->timestamp('invited_at')->nullable()->after('invited_by');
            $table->timestamp('accepted_at')->nullable()->after('invited_at');
        });

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
