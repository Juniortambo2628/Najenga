<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Roles as in the OKJT kit (and Naoa): admins become superadmins
 * (users.is_superadmin), and a project's managers become co-owners. The client
 * (projects.client_id) stays the one owner who can't be removed and alone
 * deletes the project or changes co-owners. users.role stays for now; it is
 * dropped later, once nothing reads it.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'is_superadmin')) {
            Schema::table('users', fn (Blueprint $table) => $table->boolean('is_superadmin')->default(false));
        }
        DB::table('users')->where('role', 'admin')->update(['is_superadmin' => true]);

        DB::table('project_user')->where('role', 'manager')->update(['role' => 'owner']);
        DB::table('project_invitations')->where('role', 'manager')->update(['role' => 'owner']);
    }

    public function down(): void
    {
        // Co-owners who are a project's assigned manager go back to manager; the
        // rest stay owners (there's no record of which were managers before).
        foreach (DB::table('projects')->whereNotNull('manager_id')->get(['id', 'manager_id', 'client_id']) as $project) {
            if ((int) $project->manager_id !== (int) $project->client_id) {
                DB::table('project_user')->where('project_id', $project->id)->where('user_id', $project->manager_id)
                    ->where('role', 'owner')->update(['role' => 'manager']);
            }
        }

        if (Schema::hasColumn('users', 'is_superadmin')) {
            Schema::table('users', fn (Blueprint $table) => $table->dropColumn('is_superadmin'));
        }
    }
};
