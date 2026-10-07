<?php

namespace Tests\Feature;

use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class StorageControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_storage(): void
    {
        $this->get('/storage/test/file.txt')
            ->assertStatus(403);
    }

    public function test_authenticated_user_gets_response_for_nonexistent_file(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($user)
            ->get('/storage/nonexistent/file.txt');

        $this->assertContains($response->status(), [403, 404]);
    }

    public function test_owner_can_read_their_own_storage_file(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'client']);
        $path = $this->seedPhotoMedia($user, 7);

        $this->actingAs($user)
            ->get('/storage/' . $path)
            ->assertOk();
    }

    public function test_user_cannot_read_another_users_storage_file(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create(['role' => 'client']);
        $user = User::factory()->create(['role' => 'client']);
        $path = $this->seedPhotoMedia($owner, 8);

        $this->actingAs($user)
            ->get('/storage/' . $path)
            ->assertForbidden();
    }

    public function test_admin_can_read_any_storage_file(): void
    {
        Storage::fake('public');
        $owner = User::factory()->create(['role' => 'client']);
        $admin = User::factory()->create(['role' => 'admin']);
        $path = $this->seedPhotoMedia($owner, 9);

        $this->actingAs($admin)
            ->get('/storage/' . $path)
            ->assertOk();
    }

    public function test_orphaned_file_is_forbidden_for_non_admins(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'client']);
        Storage::disk('public')->put('42/rogue.jpg', 'bytes');

        $this->actingAs($user)
            ->get('/storage/42/rogue.jpg')
            ->assertForbidden();
    }

    private function seedPhotoMedia(User $owner, int $mediaId): string
    {
        $photo = Photo::factory()->create(['user_id' => $owner->id]);

        Media::query()->insert([
            'id' => $mediaId,
            'model_type' => Photo::class,
            'model_id' => $photo->id,
            'collection_name' => 'photos',
            'name' => 'shot.jpg',
            'file_name' => 'shot.jpg',
            'mime_type' => 'image/jpeg',
            'disk' => 'public',
            'size' => 11,
            'manipulations' => '[]',
            'custom_properties' => '[]',
            'generated_conversions' => '[]',
            'responsive_images' => '[]',
            'order_column' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $path = $mediaId . '/shot.jpg';
        Storage::disk('public')->put($path, 'image-bytes');

        return $path;
    }
}
