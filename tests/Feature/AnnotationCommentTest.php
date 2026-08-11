<?php

namespace Tests\Feature;

use App\Models\Annotation;
use App\Models\Comment;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnotationCommentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Photo $photo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $this->otherUser = User::factory()->create(['role' => 'client']);
        $project = Project::factory()->create(['client_id' => $this->user->id]);
        $this->photo = Photo::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $project->id,
        ]);
    }

    public function test_user_can_create_annotation(): void
    {
        $this->actingAs($this->user)
            ->postJson('/annotations', [
                'annotatable_type' => 'photo',
                'annotatable_id' => $this->photo->id,
                'x' => 100,
                'y' => 200,
                'width' => 150,
                'height' => 100,
                'body' => 'This needs fixing',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('annotations', [
            'annotatable_type' => 'App\\Models\\Photo',
            'annotatable_id' => $this->photo->id,
            'body' => 'This needs fixing',
        ]);
    }

    public function test_user_can_update_own_annotation(): void
    {
        $annotation = Annotation::factory()->create([
            'annotatable_type' => Photo::class,
            'annotatable_id' => $this->photo->id,
            'user_id' => $this->user->id,
            'body' => 'Original note',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/annotations/{$annotation->id}", [
                'body' => 'Updated note',
            ])
            ->assertOk();

        $this->assertDatabaseHas('annotations', [
            'id' => $annotation->id,
            'body' => 'Updated note',
        ]);
    }

    public function test_user_cannot_update_other_users_annotation(): void
    {
        $annotation = Annotation::factory()->create([
            'annotatable_type' => Photo::class,
            'annotatable_id' => $this->photo->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->otherUser)
            ->patchJson("/annotations/{$annotation->id}", ['body' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_annotation(): void
    {
        $annotation = Annotation::factory()->create([
            'annotatable_type' => Photo::class,
            'annotatable_id' => $this->photo->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/annotations/{$annotation->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('annotations', ['id' => $annotation->id]);
    }

    public function test_user_can_create_comment(): void
    {
        $this->actingAs($this->user)
            ->postJson('/comments', [
                'commentable_type' => 'photo',
                'commentable_id' => $this->photo->id,
                'body' => 'Great photo!',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('comments', [
            'commentable_type' => 'App\\Models\\Photo',
            'commentable_id' => $this->photo->id,
            'body' => 'Great photo!',
        ]);
    }

    public function test_user_can_update_own_comment(): void
    {
        $comment = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $this->photo->id,
            'user_id' => $this->user->id,
            'body' => 'Original comment',
        ]);

        $this->actingAs($this->user)
            ->patchJson("/comments/{$comment->id}", [
                'body' => 'Updated comment',
            ])
            ->assertOk();

        $this->assertDatabaseHas('comments', [
            'id' => $comment->id,
            'body' => 'Updated comment',
        ]);
    }

    public function test_user_cannot_update_other_users_comment(): void
    {
        $comment = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $this->photo->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->otherUser)
            ->patchJson("/comments/{$comment->id}", ['body' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_comment(): void
    {
        $comment = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $this->photo->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->deleteJson("/comments/{$comment->id}")
            ->assertOk();

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }

    public function test_unauthenticated_user_cannot_create_annotation(): void
    {
        $this->postJson('/annotations', [
            'annotatable_type' => 'photo',
            'annotatable_id' => $this->photo->id,
            'x' => 0,
            'y' => 0,
        ])->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_create_comment(): void
    {
        $this->postJson('/comments', [
            'commentable_type' => 'photo',
            'commentable_id' => $this->photo->id,
            'body' => 'test',
        ])->assertUnauthorized();
    }
}
