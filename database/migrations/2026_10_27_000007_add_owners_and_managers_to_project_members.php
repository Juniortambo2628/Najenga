<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Phase 12.5: the project member list includes everyone with a role.
 *
 * Each project's client becomes an 'owner' member and its assigned manager
 * (projects.manager_id) a 'manager' member, so the Share panel shows them
 * and project notifications reach them. A manager who was already a member
 * is promoted; nobody is demoted. Project keeps these rows in step when a
 * project is created or its client/manager changes.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('projects')->orderBy('id')->each(function ($project) use ($now) {
            if ($project->client_id) {
                $this->grant($project->id, $project->client_id, 'owner', $now);
            }
            if ($project->manager_id && $project->manager_id !== $project->client_id) {
                $this->grant($project->id, $project->manager_id, 'manager', $now);
            }
        });
    }

    public function down(): void
    {
        // Rows this migration added carry no invitation; members who joined
        // through the Share panel (invited_at set) are left alone.
        DB::table('project_user')->where('role', 'owner')->delete();
        DB::table('projects')->whereNotNull('manager_id')->orderBy('id')->each(function ($project) {
            DB::table('project_user')
                ->where('project_id', $project->id)
                ->where('user_id', $project->manager_id)
                ->where('role', 'manager')
                ->whereNull('invited_at')
                ->delete();
        });
    }

    private function grant(int $projectId, int $userId, string $role, $now): void
    {
        $rank = ['owner' => 0, 'manager' => 1, 'editor' => 2, 'viewer' => 3];
        $row = DB::table('project_user')->where('project_id', $projectId)->where('user_id', $userId)->first();

        if (! $row) {
            DB::table('project_user')->insert([
                'project_id' => $projectId,
                'user_id' => $userId,
                'role' => $role,
                'accepted_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } elseif (($rank[$row->role] ?? 9) > $rank[$role]) {
            DB::table('project_user')->where('id', $row->id)->update(['role' => $role, 'updated_at' => $now]);
        }
    }
};
