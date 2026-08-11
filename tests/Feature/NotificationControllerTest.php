<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
    }

    private function createDatabaseNotification(User $user, array $data = []): object
    {
        $id = Str::uuid()->toString();
        DB::table('notifications')->insert([
            'id' => $id,
            'type' => 'App\\Notifications\\NewActivityNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => json_encode($data + ['title' => 'Test', 'body' => 'Test body']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return (object) ['id' => $id];
    }

    public function test_unauthenticated_user_cannot_access_notifications(): void
    {
        $this->getJson('/notifications')
            ->assertStatus(401);
    }

    public function test_user_can_list_notifications(): void
    {
        $this->actingAs($this->user)
            ->getJson('/notifications')
            ->assertOk()
            ->assertJsonStructure([]);
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $notification = $this->createDatabaseNotification($this->user);

        $this->actingAs($this->user)
            ->postJson("/notifications/{$notification->id}/read")
            ->assertOk();

        $dbNotification = DB::table('notifications')->where('id', $notification->id)->first();
        $this->assertNotNull($dbNotification->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $this->createDatabaseNotification($this->user, ['title' => 'Test 1']);
        $this->createDatabaseNotification($this->user, ['title' => 'Test 2']);

        $this->actingAs($this->user)
            ->postJson('/notifications/read-all')
            ->assertOk();

        $this->assertCount(0, $this->user->unreadNotifications);
    }

    public function test_nonexistent_notification_returns_404(): void
    {
        $this->actingAs($this->user)
            ->postJson('/notifications/' . Str::uuid() . '/read')
            ->assertStatus(404);
    }
}
