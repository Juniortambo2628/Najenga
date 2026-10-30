<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\ProjectInvitationNotification;
use App\Services\ProjectInvitations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProjectInvitationTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        $this->owner = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->owner->id, 'name' => 'Kitengela site']);
    }

    /** Invite as the owner and return the emailed link. */
    private function inviteAndGetLink(string $email, string $role = 'editor'): string
    {
        $this->actingAs($this->owner)
            ->postJson("/projects/{$this->project->id}/invitations", ['email' => $email, 'role' => $role])
            ->assertCreated();

        $url = null;
        Notification::assertSentTo(new AnonymousNotifiable, ProjectInvitationNotification::class, function ($n, $channels, $notifiable) use ($email, &$url) {
            $url = $n->url;

            return $notifiable->routes['mail'] === $email;
        });
        auth()->logout();

        return $url;
    }

    public function test_existing_users_are_added_straight_away(): void
    {
        $colleague = User::factory()->create(['email' => 'Wanjiru@Example.com']);

        $this->actingAs($this->owner)
            ->postJson("/projects/{$this->project->id}/invitations", ['email' => 'wanjiru@example.com', 'role' => 'viewer'])
            ->assertOk()
            ->assertJson(['status' => 'added']);

        $this->assertSame('viewer', $this->project->roleFor($colleague));
        $this->assertDatabaseCount('project_invitations', 0);
        Notification::assertNothingSent();
    }

    public function test_people_without_an_account_get_an_emailed_invitation(): void
    {
        $this->actingAs($this->owner)
            ->postJson("/projects/{$this->project->id}/invitations", ['email' => 'New.Person@example.com', 'role' => 'editor'])
            ->assertCreated()
            ->assertJson(['status' => 'invited']);

        $invitation = ProjectInvitation::sole();
        $this->assertSame('new.person@example.com', $invitation->email);
        $this->assertSame('editor', $invitation->role);
        $this->assertTrue($invitation->expires_at->between(now()->addDays(6), now()->addDays(8)));
        $this->assertSame(64, strlen($invitation->token_hash));
        Notification::assertSentTo(new AnonymousNotifiable, ProjectInvitationNotification::class);
    }

    public function test_inviting_the_same_address_again_refreshes_the_open_invitation(): void
    {
        $this->inviteAndGetLink('again@example.com');
        $first = ProjectInvitation::sole()->token_hash;
        $this->inviteAndGetLink('again@example.com', 'viewer');

        $this->assertSame(1, ProjectInvitation::count());
        $this->assertNotSame($first, ProjectInvitation::sole()->token_hash);
        $this->assertSame('viewer', ProjectInvitation::sole()->role);
    }

    public function test_only_owners_invite_and_only_the_client_makes_co_owners(): void
    {
        foreach (['viewer', 'editor'] as $role) {
            $member = User::factory()->create();
            $this->project->users()->attach($member->id, ['role' => $role]);
            $this->actingAs($member)
                ->postJson("/projects/{$this->project->id}/invitations", ['email' => "x-{$role}@example.com", 'role' => 'viewer'])
                ->assertForbidden();
        }

        $manager = User::factory()->create();
        $this->project->users()->attach($manager->id, ['role' => 'owner']); // a co-owner
        $this->actingAs($manager)
            ->postJson("/projects/{$this->project->id}/invitations", ['email' => 'm@example.com', 'role' => 'owner'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('role');
        $this->actingAs($manager)
            ->postJson("/projects/{$this->project->id}/invitations", ['email' => 'm@example.com', 'role' => 'editor'])
            ->assertCreated();

        $this->actingAs($this->owner)
            ->postJson("/projects/{$this->project->id}/invitations", ['email' => 'boss@example.com', 'role' => 'owner'])
            ->assertCreated();
    }

    public function test_a_guest_signs_up_from_the_link_and_joins(): void
    {
        $link = $this->inviteAndGetLink('fresh@example.com', 'editor');

        $this->get($link)->assertRedirect(route('register', ['email' => 'fresh@example.com']));

        $this->get(route('register'))
            ->assertInertia(fn ($page) => $page->where('email', 'fresh@example.com')->where('joiningProject', 'Kitengela site'));

        $this->post('/register', [
            'first_name' => 'Fresh', 'last_name' => 'Person', 'username' => 'fresh',
            'email' => 'fresh@example.com', 'password' => 'password', 'password_confirmation' => 'password',
        ])->assertRedirect(route('projects.show', $this->project));

        $user = User::where('email', 'fresh@example.com')->sole();
        $this->assertSame('editor', $this->project->roleFor($user));
        $this->assertTrue($user->hasVerifiedEmail());
        $this->assertNotNull(ProjectInvitation::sole()->accepted_at);
        $this->assertSame($user->id, ProjectInvitation::sole()->accepted_by);
    }

    public function test_a_guest_with_an_account_signs_in_from_the_link_and_joins(): void
    {
        $link = $this->inviteAndGetLink('later@example.com');
        $user = User::factory()->create(['email' => 'later@example.com', 'password' => bcrypt('password')]);

        $this->get($link)->assertRedirect(route('login'));
        $this->post('/login', ['email' => 'later@example.com', 'password' => 'password'])
            ->assertRedirect(route('projects.show', $this->project));

        $this->assertSame('editor', $this->project->roleFor($user));
    }

    public function test_a_signed_in_user_joins_from_the_link(): void
    {
        $link = $this->inviteAndGetLink('member@example.com');
        $user = User::factory()->create(['email' => 'member@example.com']);

        $this->actingAs($user)->get($link)
            ->assertRedirect(route('projects.show', $this->project))
            ->assertSessionHas('success', 'You joined "Kitengela site"');
        $this->assertSame('editor', $this->project->roleFor($user));
    }

    public function test_someone_else_cannot_use_the_link(): void
    {
        $link = $this->inviteAndGetLink('intended@example.com');
        $stranger = User::factory()->create(['email' => 'stranger@example.com']);

        $this->actingAs($stranger)->get($link)
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('error');
        $this->assertNull($this->project->roleFor($stranger));
        $this->assertNull(ProjectInvitation::sole()->accepted_at);
    }

    public function test_tampered_expired_revoked_or_used_links_do_not_work(): void
    {
        $link = $this->inviteAndGetLink('x@example.com');
        $user = User::factory()->create(['email' => 'x@example.com']);

        // Signature broken
        $this->actingAs($user)->get(str_replace('token=', 'token=zz', $link))->assertForbidden();

        // Revoked
        $invitation = ProjectInvitation::sole();
        app(ProjectInvitations::class)->revoke($invitation);
        $this->actingAs($user)->get($link)->assertSessionHas('error');
        $this->assertNull($this->project->roleFor($user));

        // Expired invitation
        $invitation->forceFill(['revoked_at' => null, 'expires_at' => now()->subMinute()])->save();
        $this->actingAs($user)->get($link)->assertSessionHas('error');
        $this->assertNull($this->project->roleFor($user));

        // After 7 days the signed link itself has expired
        $this->travel(8)->days();
        $this->actingAs($user)->get($link)->assertForbidden();
    }

    public function test_resend_gives_a_new_link_and_revoke_ends_it(): void
    {
        $old = $this->inviteAndGetLink('r@example.com');
        $invitation = ProjectInvitation::sole();

        $this->actingAs($this->owner)
            ->postJson("/projects/{$this->project->id}/invitations/{$invitation->id}/resend")
            ->assertOk();
        $user = User::factory()->create(['email' => 'r@example.com']);
        $this->actingAs($user)->get($old)->assertForbidden(); // old token no longer matches

        $this->actingAs($this->owner)
            ->deleteJson("/projects/{$this->project->id}/invitations/{$invitation->id}")
            ->assertOk();
        $this->assertNotNull($invitation->fresh()->revoked_at);
    }

    public function test_members_list_shows_pending_invitations_to_managers_only(): void
    {
        $this->inviteAndGetLink('pending@example.com');
        $viewer = User::factory()->create();
        $this->project->users()->attach($viewer->id, ['role' => 'viewer']);

        $this->actingAs($this->owner)->getJson("/projects/{$this->project->id}/members")
            ->assertOk()
            ->assertJsonPath('members.0.role', 'owner')
            ->assertJsonPath('invitations.0.email', 'pending@example.com')
            ->assertJsonPath('can_manage', true);

        $this->actingAs($viewer)->getJson("/projects/{$this->project->id}/members")
            ->assertOk()
            ->assertJsonCount(0, 'invitations')
            ->assertJsonPath('can_manage', false);

        $this->actingAs(User::factory()->create())->getJson("/projects/{$this->project->id}/members")->assertForbidden();
    }
}
