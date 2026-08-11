<?php

namespace Tests\Feature;

use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhotoControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'client']);
        $this->otherUser = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->user->id]);
    }

    public function test_unauthenticated_user_cannot_access_photos(): void
    {
        $this->get('/photos')->assertRedirect('/login');
    }

    public function test_user_can_view_photos_index(): void
    {
        Photo::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->get('/photos')
            ->assertOk();
    }

    public function test_user_can_update_photo(): void
    {
        $photo = Photo::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/photos/{$photo->id}", [
                'title' => 'Updated Photo Title',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('photos', [
            'id' => $photo->id,
            'title' => 'Updated Photo Title',
        ]);
    }

    public function test_user_cannot_update_other_users_photo(): void
    {
        $photo = Photo::factory()->create([
            'user_id' => $this->otherUser->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->patch("/photos/{$photo->id}", ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_photo(): void
    {
        $photo = Photo::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/photos/{$photo->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('photos', ['id' => $photo->id]);
    }

    public function test_user_cannot_delete_other_users_photo(): void
    {
        $photo = Photo::factory()->create([
            'user_id' => $this->otherUser->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->delete("/photos/{$photo->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('photos', ['id' => $photo->id]);
    }

    public function test_user_can_view_photo(): void
    {
        $photo = Photo::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->get("/photos/{$photo->id}")
            ->assertOk()
            ->assertJson(['id' => $photo->id]);
    }
}
