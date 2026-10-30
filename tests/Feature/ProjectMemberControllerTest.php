<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectMemberControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $manager;

    private User $manager2;

    private User $editor;

    private User $viewer;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = User::factory()->create(['first_name' => 'Olive', 'last_name' => 'Owner']);
        $this->project = Project::factory()->create(['client_id' => $this->owner->id]);
        foreach (['manager', 'manager2', 'editor', 'viewer'] as $who) {
            $this->{$who} = User::factory()->create();
            $this->project->users()->attach($this->{$who}->id, ['role' => in_array($who, ['manager', 'manager2'], true) ? 'owner' : $who]);
        }
    }

    public function test_members_are_listed_owner_first_with_what_the_viewer_may_do(): void
    {
        $this->actingAs($this->owner)->getJson("/projects/{$this->project->id}/members")
            ->assertOk()
            ->assertJsonCount(5, 'members')
            ->assertJsonPath('members.0.id', $this->owner->id)
            ->assertJsonPath('members.0.role', 'owner')
            ->assertJsonPath('my_role', 'owner')
            ->assertJsonPath('members.0.is_client', true)
            ->assertJsonPath('i_am_client', true)
            ->assertJsonPath('assignable', ['owner', 'editor', 'viewer']);

        $this->actingAs($this->manager)->getJson("/projects/{$this->project->id}/members")
            ->assertJsonPath('my_role', 'owner')
            ->assertJsonPath('i_am_client', false)
            ->assertJsonPath('assignable', ['editor', 'viewer']);

        $this->actingAs($this->viewer)->getJson("/projects/{$this->project->id}/members")
            ->assertJsonPath('can_manage', false)
            ->assertJsonPath('assignable', []);
    }

    public function test_the_client_changes_any_role_except_their_own(): void
    {
        $this->actingAs($this->owner)
            ->patchJson("/projects/{$this->project->id}/members/{$this->viewer->id}", ['role' => 'owner'])
            ->assertOk()
            ->assertJsonPath('message', fn ($m) => str_contains($m, 'a co-owner'));
        $this->assertSame('owner', $this->project->roleFor($this->viewer));

        $this->actingAs($this->owner)
            ->patchJson("/projects/{$this->project->id}/members/{$this->owner->id}", ['role' => 'viewer'])
            ->assertUnprocessable();
        $this->assertSame('owner', $this->project->roleFor($this->owner));
    }

    public function test_co_owners_manage_editors_and_viewers_only(): void
    {
        $this->actingAs($this->manager)
            ->patchJson("/projects/{$this->project->id}/members/{$this->viewer->id}", ['role' => 'editor'])
            ->assertOk();

        $this->actingAs($this->manager)
            ->patchJson("/projects/{$this->project->id}/members/{$this->viewer->id}", ['role' => 'owner'])
            ->assertUnprocessable();

        $this->actingAs($this->manager)
            ->patchJson("/projects/{$this->project->id}/members/{$this->manager2->id}", ['role' => 'viewer'])
            ->assertForbidden();
        $this->actingAs($this->manager)
            ->deleteJson("/projects/{$this->project->id}/members/{$this->manager2->id}")
            ->assertForbidden();
        $this->assertSame('owner', $this->project->roleFor($this->manager2));
    }

    public function test_co_owners_can_leave_but_the_client_cannot(): void
    {
        $this->actingAs($this->owner)->deleteJson("/projects/{$this->project->id}/members/{$this->owner->id}")->assertUnprocessable();
        $this->actingAs($this->manager)->deleteJson("/projects/{$this->project->id}/members/{$this->manager->id}")->assertOk();
        $this->assertNull($this->project->roleFor($this->manager));
    }

    public function test_editors_and_viewers_cannot_manage_members(): void
    {
        foreach (['editor', 'viewer'] as $who) {
            $this->actingAs($this->{$who})
                ->patchJson("/projects/{$this->project->id}/members/{$this->viewer->id}", ['role' => 'editor'])
                ->assertForbidden();
        }
        $this->actingAs($this->editor)
            ->deleteJson("/projects/{$this->project->id}/members/{$this->viewer->id}")
            ->assertForbidden();
    }

    public function test_removing_members_and_leaving(): void
    {
        $this->actingAs($this->owner)
            ->deleteJson("/projects/{$this->project->id}/members/{$this->editor->id}")
            ->assertOk();
        $this->assertNull($this->project->roleFor($this->editor));

        // Anyone but the owner can leave.
        $this->actingAs($this->viewer)
            ->deleteJson("/projects/{$this->project->id}/members/{$this->viewer->id}")
            ->assertOk()
            ->assertJsonPath('message', sprintf('You left "%s"', $this->project->name));
        $this->assertNull($this->project->roleFor($this->viewer));

        $this->actingAs($this->owner)
            ->deleteJson("/projects/{$this->project->id}/members/{$this->owner->id}")
            ->assertUnprocessable();
        $this->assertSame('owner', $this->project->roleFor($this->owner));
    }

    public function test_strangers_see_nothing(): void
    {
        $stranger = User::factory()->create();
        $this->actingAs($stranger)->getJson("/projects/{$this->project->id}/members")->assertForbidden();
        $this->actingAs($stranger)->deleteJson("/projects/{$this->project->id}/members/{$stranger->id}")->assertForbidden();
    }
}
