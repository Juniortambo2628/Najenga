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
 * are new. Every project's client becomes an 'owner' row, so the pivot is the
 * one list of who is in a project (projects.client_id stays as it is).
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

        // The client of each project becomes its owner.
        $now = now();
        DB::table('projects')->whereNotNull('client_id')->orderBy('id')->each(function ($project) use ($now) {
            $member = DB::table('project_user')
                ->where('project_id', $project->id)
                ->where('user_id', $project->client_id);

            if ($member->exists()) {
                $member->update(['role' => 'owner', 'updated_at' => $now]);
            } else {
                DB::table('project_user')->insert([
                    'project_id' => $project->id,
                    'user_id' => $project->client_id,
                    'role' => 'owner',
                    'accepted_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });
    }

    public function down(): void
    {
        // Owner rows came from projects.client_id, which still holds them.
        DB::table('project_user')->where('role', 'owner')->delete();

        Schema::table('project_user', function (Blueprint $table) {
            $table->dropConstrainedForeignId('invited_by');
            $table->dropColumn(['invited_at', 'accepted_at']);
        });
    }
};
