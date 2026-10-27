<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProjectMembersBackfillTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): object
    {
        return require database_path('migrations/2026_10_27_000007_add_owners_and_managers_to_project_members.php');
    }

    public function test_clients_become_owners_and_assigned_managers_become_managers(): void
    {
        $client = User::factory()->create();
        $manager = User::factory()->create();
        $editorManager = User::factory()->create();
        $a = Project::factory()->create(['client_id' => $client->id, 'manager_id' => $manager->id]);
        $b = Project::factory()->create(['client_id' => $client->id, 'manager_id' => $editorManager->id]);

        // As before this migration: no owner/manager rows, one manager already an editor.
        DB::table('project_user')->delete();
        DB::table('project_user')->insert(['project_id' => $b->id, 'user_id' => $editorManager->id, 'role' => 'editor', 'created_at' => now(), 'updated_at' => now()]);

        $this->migration()->up();

        $this->assertSame('owner', $a->roleFor($client));
        $this->assertSame('manager', $a->roleFor($manager));
        $this->assertSame('manager', $b->roleFor($editorManager)); // promoted
        $this->assertSame(2, DB::table('project_user')->where('role', 'owner')->count());

        // Running it again changes nothing.
        $this->migration()->up();
        $this->assertSame(4, DB::table('project_user')->count());

        $this->migration()->down();
        $this->assertSame(0, DB::table('project_user')->whereIn('role', ['owner', 'manager'])->count());
    }

    public function test_new_projects_and_changed_clients_keep_member_rows_in_step(): void
    {
        $client = User::factory()->create();
        $manager = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $client->id, 'manager_id' => $manager->id]);

        $this->assertSame('owner', $project->users()->where('users.id', $client->id)->value('project_user.role'));
        $this->assertSame('manager', $project->users()->where('users.id', $manager->id)->value('project_user.role'));

        $viewer = User::factory()->create();
        $project->users()->attach($viewer->id, ['role' => 'viewer']);
        $project->update(['manager_id' => $viewer->id]);

        $this->assertSame('manager', $project->users()->where('users.id', $viewer->id)->value('project_user.role'));
    }
}
