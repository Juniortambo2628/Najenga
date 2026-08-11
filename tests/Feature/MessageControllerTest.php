<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Conversation $conversation;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $this->otherUser = User::factory()->create(['role' => 'client']);
        $this->conversation = Conversation::factory()->create();
        $this->conversation->users()->attach([$this->user->id, $this->otherUser->id]);
    }

    public function test_member_can_update_message(): void
    {
        $message = Message::factory()->create([
            'conversation_id' => $this->conversation->id,
            'user_id' => $this->user->id,
            'body' => 'Original',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/conversations/{$this->conversation->id}/messages/{$message->id}", [
                'body' => 'Updated message',
            ])
            ->assertOk()
            ->assertJsonPath('body', 'Updated message');

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'body' => 'Updated message',
        ]);
    }

    public function test_non_owner_cannot_update_message(): void
    {
        $message = Message::factory()->create([
            'conversation_id' => $this->conversation->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->otherUser)
            ->patchJson("/conversations/{$this->conversation->id}/messages/{$message->id}", [
                'body' => 'Hacked',
            ])
            ->assertForbidden();
    }

    public function test_member_can_delete_message(): void
    {
        $message = Message::factory()->create([
            'conversation_id' => $this->conversation->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/conversations/{$this->conversation->id}/messages/{$message->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_non_owner_cannot_delete_message(): void
    {
        $message = Message::factory()->create([
            'conversation_id' => $this->conversation->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->otherUser)
            ->deleteJson("/conversations/{$this->conversation->id}/messages/{$message->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('messages', ['id' => $message->id]);
    }

    public function test_update_requires_body(): void
    {
        $message = Message::factory()->create([
            'conversation_id' => $this->conversation->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->patchJson("/conversations/{$this->conversation->id}/messages/{$message->id}", [
                'body' => '',
            ])
            ->assertStatus(422);
    }

    public function test_non_member_cannot_update_message(): void
    {
        $stranger = User::factory()->create();
        $message = Message::factory()->create([
            'conversation_id' => $this->conversation->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($stranger)
            ->patchJson("/conversations/{$this->conversation->id}/messages/{$message->id}", [
                'body' => 'Intruder',
            ])
            ->assertForbidden();
    }

    public function test_non_member_cannot_delete_message(): void
    {
        $stranger = User::factory()->create();
        $message = Message::factory()->create([
            'conversation_id' => $this->conversation->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($stranger)
            ->deleteJson("/conversations/{$this->conversation->id}/messages/{$message->id}")
            ->assertForbidden();
    }
}
