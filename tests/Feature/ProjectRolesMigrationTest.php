<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * The 12.2 migration adds invitation state to project_user and marks existing
 * members as accepted. It adds no owner/manager rows: those come with 12.5.
 */
class ProjectRolesMigrationTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): object
    {
        return require database_path('migrations/2026_10_27_000001_add_project_roles_and_invitation_state_to_project_user.php');
    }

    public function test_existing_members_are_accepted_and_keep_their_roles(): void
    {
        $client = User::factory()->create();
        $editor = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $client->id]);

        // Start from the schema before the migration.
        $this->migration()->down();
        $this->assertFalse(Schema::hasColumn('project_user', 'accepted_at'));
        $joined = now()->subDay()->startOfSecond();
        DB::table('project_user')->insert([
            'project_id' => $project->id, 'user_id' => $editor->id, 'role' => 'editor', 'created_at' => $joined, 'updated_at' => $joined,
        ]);

        $this->migration()->up();

        $row = DB::table('project_user')->where('user_id', $editor->id)->first();
        $this->assertSame('editor', $row->role);
        $this->assertEquals($joined, \Carbon\Carbon::parse($row->accepted_at));
        $this->assertNull($row->invited_by);
        // No owner rows yet: the client is still only projects.client_id.
        $this->assertSame(1, DB::table('project_user')->count());
        $this->assertTrue(Schema::hasColumns('project_user', ['invited_by', 'invited_at', 'accepted_at']));
    }
}
