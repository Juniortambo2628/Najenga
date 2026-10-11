<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FlashSharingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_success_flash_is_shared_with_the_page(): void
    {
        $this->actingAs($this->user)
            ->withSession(['success' => 'Expense added successfully'])
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('flash.success', 'Expense added successfully'));
    }

    public function test_status_flash_is_shared_for_guest_pages(): void
    {
        $this->withSession(['status' => 'verification-link-sent'])
            ->get('/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('flash.status', 'verification-link-sent'));
    }

    public function test_flash_keys_are_null_when_the_session_carries_no_message(): void
    {
        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('flash.success', null)
                ->where('flash.error', null)
                ->where('flash.status', null));
    }

    public function test_flash_survives_a_post_redirect_round_trip(): void
    {
        // The controller flashes on the way back; the following Inertia visit
        // must be the one that sees it, otherwise the message is never shown.
        $project = Project::factory()->create(['client_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->post(route('folders.store'), [
                'name' => 'Handover',
                'project_id' => $project->id,
            ])
            ->assertStatus(302);

        $this->actingAs($this->user)
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('flash.success', 'Folder created successfully'));
    }
}
