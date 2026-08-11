<?php

namespace Tests\Feature;

use App\Models\Annotation;
use App\Models\Comment;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnotationCommentIndexTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Photo $photo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $project = \App\Models\Project::factory()->create(['client_id' => $this->user->id]);
        $this->photo = Photo::factory()->create(['user_id' => $this->user->id, 'project_id' => $project->id]);
    }

    public function test_user_can_list_annotations(): void
    {
        Annotation::factory()->count(3)->create([
            'annotatable_type' => Photo::class,
            'annotatable_id' => $this->photo->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->getJson('/annotations?annotatable_id=' . $this->photo->id . '&annotatable_type=photo')
            ->assertOk()
            ->assertJsonCount(3);
    }

    public function test_annotations_index_requires_parameters(): void
    {
        $this->actingAs($this->user)
            ->getJson('/annotations')
            ->assertStatus(422);
    }

    public function test_user_can_list_comments(): void
    {
        Comment::factory()->count(2)->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $this->photo->id,
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->getJson('/comments?commentable_id=' . $this->photo->id . '&commentable_type=photo')
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_comments_index_requires_parameters(): void
    {
        $this->actingAs($this->user)
            ->getJson('/comments')
            ->assertStatus(422);
    }

    public function test_comment_replies_are_nested(): void
    {
        $parent = Comment::factory()->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $this->photo->id,
            'user_id' => $this->user->id,
        ]);
        Comment::factory()->count(2)->create([
            'commentable_type' => Photo::class,
            'commentable_id' => $this->photo->id,
            'user_id' => $this->user->id,
            'parent_id' => $parent->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/comments?commentable_id=' . $this->photo->id . '&commentable_type=photo')
            ->assertOk();

        $comments = $response->json();
        $topLevel = collect($comments)->filter(fn($c) => !isset($c['parent_id']) || $c['parent_id'] === null);
        $this->assertCount(1, $topLevel);
    }

    public function test_annotation_with_nonexistent_type_returns_400(): void
    {
        $this->actingAs($this->user)
            ->getJson('/annotations?annotatable_id=1&annotatable_type=invalid')
            ->assertStatus(400);
    }

    public function test_comment_with_nonexistent_type_returns_400(): void
    {
        $this->actingAs($this->user)
            ->getJson('/comments?commentable_id=1&commentable_type=invalid')
            ->assertStatus(400);
    }
}
