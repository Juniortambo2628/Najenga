<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationMessageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $this->otherUser = User::factory()->create(['role' => 'client']);
    }

    public function test_user_can_list_conversations(): void
    {
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach([$this->user->id, $this->otherUser->id]);

        $this->actingAs($this->user)
            ->getJson('/conversations')
            ->assertOk();
    }

    public function test_user_can_create_conversation(): void
    {
        $this->actingAs($this->user)
            ->postJson('/conversations', [
                'user_id' => $this->otherUser->id,
            ])
            ->assertOk();

        $this->assertDatabaseHas('conversation_user', [
            'user_id' => $this->user->id,
        ]);
    }

    public function test_user_can_send_message(): void
    {
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach([$this->user->id, $this->otherUser->id]);

        $this->actingAs($this->user)
            ->postJson("/conversations/{$conversation->id}/messages", [
                'body' => 'Hello there!',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'user_id' => $this->user->id,
            'body' => 'Hello there!',
        ]);
    }

    public function test_user_can_list_messages(): void
    {
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach([$this->user->id, $this->otherUser->id]);

        Message::factory()->count(3)->create([
            'conversation_id' => $conversation->id,
            'user_id' => $this->otherUser->id,
        ]);

        $this->actingAs($this->user)
            ->getJson("/conversations/{$conversation->id}/messages")
            ->assertOk();
    }

    public function test_user_can_delete_own_conversation(): void
    {
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach([$this->user->id]);

        $this->actingAs($this->user)
            ->deleteJson("/conversations/{$conversation->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('conversations', ['id' => $conversation->id]);
    }

    public function test_user_can_leave_conversation(): void
    {
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach([$this->user->id, $this->otherUser->id]);

        $this->actingAs($this->user)
            ->postJson("/conversations/{$conversation->id}/leave")
            ->assertStatus(204);

        $this->assertDatabaseMissing('conversation_user', [
            'conversation_id' => $conversation->id,
            'user_id' => $this->user->id,
        ]);
    }

    public function test_non_member_cannot_view_conversation_messages(): void
    {
        $conversation = Conversation::factory()->create();
        $conversation->users()->attach([$this->otherUser->id]);

        $this->actingAs($this->user)
            ->getJson("/conversations/{$conversation->id}/messages")
            ->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_conversations(): void
    {
        $this->getJson('/conversations')->assertUnauthorized();
    }
}
