<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * The 12.2 migration turns every project's client into an 'owner' member and
 * marks existing members as accepted; rolling back removes only owner rows.
 */
class ProjectRolesMigrationTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): object
    {
        return require database_path('migrations/2026_10_27_000001_add_project_roles_and_invitation_state_to_project_user.php');
    }

    public function test_clients_become_owners_and_members_keep_their_roles(): void
    {
        $client = User::factory()->create();
        $editor = User::factory()->create();
        $alsoMember = User::factory()->create();
        $project = Project::factory()->create(['client_id' => $client->id]);
        $other = Project::factory()->create(['client_id' => $alsoMember->id]);

        // Start from the schema before the migration.
        $this->migration()->down();
        DB::table('project_user')->insert([
            ['project_id' => $project->id, 'user_id' => $editor->id, 'role' => 'editor', 'created_at' => now()->subDay(), 'updated_at' => now()],
            // A client who was also added as a member is upgraded, not duplicated.
            ['project_id' => $other->id, 'user_id' => $alsoMember->id, 'role' => 'viewer', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->migration()->up();

        $this->assertSame('owner', $project->fresh()->roleFor($client));
        $this->assertDatabaseHas('project_user', ['project_id' => $project->id, 'user_id' => $client->id, 'role' => 'owner']);
        $this->assertDatabaseHas('project_user', ['project_id' => $project->id, 'user_id' => $editor->id, 'role' => 'editor']);
        $this->assertNotNull(DB::table('project_user')->where('user_id', $editor->id)->value('accepted_at'));
        $this->assertSame(1, DB::table('project_user')->where('project_id', $other->id)->where('user_id', $alsoMember->id)->count());
        $this->assertSame('owner', DB::table('project_user')->where('project_id', $other->id)->value('role'));

        $this->migration()->down();

        $this->assertDatabaseMissing('project_user', ['role' => 'owner']);
        $this->assertDatabaseHas('project_user', ['project_id' => $project->id, 'user_id' => $editor->id, 'role' => 'editor']);

        $this->migration()->up(); // leave the schema as the other tests expect
    }
}
