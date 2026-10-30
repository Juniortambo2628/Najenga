<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Roles as in the OKJT kit: admins become superadmins, project managers co-owners. */
class RestructureRolesMigrationTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): object
    {
        return require database_path('migrations/2026_10_31_000001_restructure_roles_like_naoa.php');
    }

    public function test_admins_become_superadmins_and_managers_co_owners(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'client']);
        $manager = User::factory()->create(['role' => 'manager']);
        $project = Project::factory()->create(['client_id' => $client->id]);

        // As before the migration: no superadmins, a manager member, a manager invitation.
        DB::table('users')->update(['is_superadmin' => false]);
        DB::table('project_user')->insert(['project_id' => $project->id, 'user_id' => $manager->id, 'role' => 'manager', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('project_invitations')->insert([
            'project_id' => $project->id, 'email' => 'later@example.com', 'role' => 'manager', 'token_hash' => str_repeat('a', 64),
            'invited_by' => $client->id, 'expires_at' => now()->addWeek(), 'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->migration()->up();

        $this->assertTrue((bool) $admin->fresh()->is_superadmin);
        $this->assertFalse((bool) $client->fresh()->is_superadmin);
        $this->assertFalse((bool) $manager->fresh()->is_superadmin);
        $this->assertSame('owner', $project->roleFor($manager));
        $this->assertSame('owner', DB::table('project_invitations')->value('role'));
        $this->assertSame(0, DB::table('project_user')->where('role', 'manager')->count());
        // The client is still the one who can't be removed or changed.
        $this->assertTrue($project->isClient($client));
        $this->assertFalse($project->isClient($manager));
    }
}
