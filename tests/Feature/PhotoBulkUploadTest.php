<?php

namespace Tests\Feature;

use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhotoBulkUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->user = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->user->id]);
    }

    private function upload(array $payload)
    {
        return $this->actingAs($this->user)
            ->postJson('/photos', ['project_id' => $this->project->id] + $payload);
    }

    public function test_upload_dates_photos_from_filename_and_folder(): void
    {
        $this->upload([
            'photos' => [
                UploadedFile::fake()->image('WhatsApp Image 2025-10-07 at 20.21.35_7b3a17e0.jpg', 10, 10),
                UploadedFile::fake()->image('site.jpg', 11, 11),
            ],
            'relative_paths' => [
                '2025/October/Busia-Photos-Oct-7/WhatsApp Image 2025-10-07 at 20.21.35_7b3a17e0.jpg',
                '2026/June-26/Jun_22/site.jpg',
            ],
        ])->assertOk()->assertJsonPath('skipped', []);

        $fromName = Photo::where('original_name', 'like', 'WhatsApp%')->firstOrFail();
        $this->assertSame('2025-10-07 20:21:35', $fromName->taken_at->format('Y-m-d H:i:s'));
        $this->assertSame('2025-10-07', $fromName->photo_date->toDateString());
        $this->assertSame('filename', $fromName->date_source);
        $this->assertNotNull($fromName->content_hash);

        $fromFolder = Photo::where('original_name', 'site.jpg')->firstOrFail();
        $this->assertSame('2026-06-22', $fromFolder->photo_date->toDateString());
        $this->assertSame('folder', $fromFolder->date_source);
        $this->assertSame('2026/June-26/Jun_22/site.jpg', $fromFolder->source_path);
    }

    public function test_duplicate_content_is_skipped_within_a_project(): void
    {
        // Same dimensions -> identical fake image bytes, like "x.jpg" and "x (1).jpg".
        $this->upload(['photos' => [UploadedFile::fake()->image('a.jpg', 20, 20)]])->assertOk();

        $this->upload([
            'photos' => [
                UploadedFile::fake()->image('a (1).jpg', 20, 20),
                UploadedFile::fake()->image('b.jpg', 21, 21),
            ],
        ])->assertOk()->assertJsonPath('skipped', ['a (1).jpg']);

        $this->assertSame(2, Photo::count());
    }

    public function test_folder_date_set_by_user_wins(): void
    {
        $this->upload([
            'photos' => [UploadedFile::fake()->image('WhatsApp Image 2025-10-07 at 20.21.35.jpg', 10, 10)],
            'taken_at' => ['2025-09-30'],
        ])->assertOk();

        $photo = Photo::firstOrFail();
        $this->assertSame('2025-09-30', $photo->photo_date->toDateString());
        $this->assertSame('manual', $photo->date_source);
    }

    public function test_undatable_upload_falls_back_to_upload_time(): void
    {
        $this->upload(['photos' => [UploadedFile::fake()->image('logo.png', 10, 10)]])->assertOk();

        $photo = Photo::firstOrFail();
        $this->assertSame('upload', $photo->date_source);
        $this->assertNotNull($photo->taken_at);
    }

    public function test_resolve_dates_previews_without_uploading(): void
    {
        $this->actingAs($this->user)
            ->postJson('/photos/resolve-dates', ['files' => [
                ['name' => 'PHOTO-2026-01-04-10-22-31.jpg', 'path' => '2026/Jan-26/PHOTO-2026-01-04-10-22-31.jpg'],
                ['name' => 'x.jpg', 'path' => 'Photos/2025/March/x.jpg'],
                ['name' => 'logo.png'],
            ]])
            ->assertOk()
            ->assertJsonPath('dates.0', ['taken_at' => '2026-01-04 10:22:31', 'source' => 'filename'])
            ->assertJsonPath('dates.1', ['taken_at' => '2025-03-01 00:00:00', 'source' => 'folder_month'])
            ->assertJsonPath('dates.2', ['taken_at' => null, 'source' => 'upload']);

        $this->assertSame(0, Photo::count());
    }

    public function test_create_page_passes_upload_limits(): void
    {
        $this->actingAs($this->user)
            ->get('/photos/create')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Photos/Create')
                ->has('uploadLimits.maxFiles')
                ->has('uploadLimits.maxBytes')
                ->has('uploadLimits.maxFileBytes'));
    }

    public function test_gallery_orders_by_when_photos_were_taken(): void
    {
        Photo::factory()->create(['user_id' => $this->user->id, 'project_id' => $this->project->id, 'title' => 'old', 'taken_at' => '2025-01-01 10:00:00']);
        Photo::factory()->create(['user_id' => $this->user->id, 'project_id' => $this->project->id, 'title' => 'new', 'taken_at' => '2026-06-22 10:00:00']);

        $this->actingAs($this->user)
            ->get('/photos')
            ->assertInertia(fn ($page) => $page
                ->where('photos.0.title', 'new')
                ->where('photos.0.photo_date', 'Jun 22, 2026')
                ->where('photos.1.title', 'old'));
    }

    public function test_backfill_dates_existing_photos(): void
    {
        $named = Photo::factory()->create([
            'user_id' => $this->user->id, 'project_id' => $this->project->id,
            'original_name' => 'IMG-20251007-WA0028.jpg', 'photo_date' => null,
        ]);
        $plain = Photo::factory()->create([
            'user_id' => $this->user->id, 'project_id' => $this->project->id,
            'original_name' => 'site.jpg', 'photo_date' => '2025-05-05',
        ]);

        $this->artisan('photos:backfill-dates')->assertSuccessful();
        $this->assertNull($named->fresh()->taken_at, 'dry run must not write');

        $this->artisan('photos:backfill-dates', ['--yes' => true])->assertSuccessful();

        $this->assertSame('2025-10-07', $named->fresh()->photo_date->toDateString());
        $this->assertSame('filename', $named->fresh()->date_source);
        $this->assertSame('2025-05-05', $plain->fresh()->taken_at->toDateString());
        $this->assertSame('upload', $plain->fresh()->date_source);
    }
}
