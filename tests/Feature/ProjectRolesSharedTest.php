<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Support\ProjectRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProjectRolesSharedTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_page_shares_the_users_projects_and_roles(): void
    {
        $me = User::factory()->create();
        $other = User::factory()->create();
        $mine = Project::factory()->create(['client_id' => $me->id, 'name' => 'B mine']);
        $shared = Project::factory()->create(['client_id' => $other->id, 'name' => 'A shared']);
        $shared->users()->attach($me->id, ['role' => ProjectRole::VIEWER]);
        Project::factory()->create(['client_id' => $other->id, 'name' => 'C not mine']);

        $this->actingAs($me)
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->has('auth.projects', 2)
                ->where('auth.projects.0', ['id' => $shared->id, 'name' => 'A shared', 'role' => 'viewer'])
                ->where('auth.projects.1', ['id' => $mine->id, 'name' => 'B mine', 'role' => 'owner']));
    }

    public function test_accessible_by_covers_own_and_member_projects_only(): void
    {
        $me = User::factory()->create();
        $other = User::factory()->create();
        $mine = Project::factory()->create(['client_id' => $me->id]);
        $shared = Project::factory()->create(['client_id' => $other->id]);
        $shared->users()->attach($me->id, ['role' => ProjectRole::EDITOR]);
        Project::factory()->create(['client_id' => $other->id]);

        $this->assertEqualsCanonicalizing([$mine->id, $shared->id], Project::accessibleBy($me)->pluck('id')->all());
        $this->assertSame([$mine->id => 'owner', $shared->id => 'editor'], Project::rolesFor($me));
    }

    public function test_role_helpers(): void
    {
        $this->assertTrue(ProjectRole::canEdit('editor'));
        $this->assertFalse(ProjectRole::canEdit('viewer'));
        $this->assertFalse(ProjectRole::canEdit(null));
        $this->assertTrue(ProjectRole::canManage('owner'));
        $this->assertFalse(ProjectRole::canManage('manager')); // managers are co-owners now
        $this->assertFalse(ProjectRole::canManage('editor'));
    }
}
