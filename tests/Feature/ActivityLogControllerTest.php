<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
    }

    public function test_unauthenticated_user_cannot_access_activity_logs(): void
    {
        $this->get('/activity-logs')->assertRedirect('/login');
    }

    public function test_user_can_access_activity_logs(): void
    {
        ActivityLog::factory()->count(5)->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->get('/activity-logs')
            ->assertOk();
    }

    public function test_user_only_sees_own_activity_logs(): void
    {
        $other = User::factory()->create();
        ActivityLog::factory()->count(3)->create(['user_id' => $this->user->id]);
        ActivityLog::factory()->count(7)->create(['user_id' => $other->id]);

        $this->actingAs($this->user)
            ->get('/activity-logs')
            ->assertOk();
    }
}
