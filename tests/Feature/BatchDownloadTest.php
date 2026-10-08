<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class BatchDownloadTest extends TestCase
{
    use RefreshDatabase;

    private function zipEntries(string $content): array
    {
        $path = tempnam(sys_get_temp_dir(), 'zip-test-');
        file_put_contents($path, $content);

        $zip = new ZipArchive();
        $this->assertTrue($zip->open($path));

        $entries = [];
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $entries[] = $zip->getNameIndex($i);
        }
        $zip->close();
        unlink($path);

        return $entries;
    }

    public function test_download_requires_authentication(): void
    {
        $this->post('/photos/download', ['ids' => [1]])->assertRedirect('/login');
        $this->post('/documents/download', ['ids' => [1]])->assertRedirect('/login');
    }

    public function test_photos_download_streams_an_owned_zip(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        Storage::disk('public')->put('photos/a.jpg', 'first-bytes');
        Storage::disk('public')->put('photos/b.jpg', 'second-bytes');

        $first = Photo::factory()->create(['user_id' => $user->id, 'file_path' => 'photos/a.jpg']);
        $second = Photo::factory()->create(['user_id' => $user->id, 'file_path' => 'photos/b.jpg']);

        $response = $this->actingAs($user)
            ->postJson('/photos/download', ['ids' => [$first->id, $second->id]]);

        $response->assertOk();
        $this->assertStringContainsString('photos-', (string) $response->headers->get('content-disposition'));
        $this->assertStringContainsString('.zip', (string) $response->headers->get('content-disposition'));
        $this->assertSame('application/zip', $response->headers->get('content-type'));

        $entries = $this->zipEntries($response->streamedContent());
        sort($entries);
        $this->assertSame([
            "{$first->id}-a.jpg",
            "{$second->id}-b.jpg",
        ], $entries);
    }

    public function test_documents_download_is_owner_scoped(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Storage::disk('public')->put('documents/mine.pdf', 'my-bytes');
        Storage::disk('public')->put('documents/theirs.pdf', 'their-bytes');

        $mine = Document::factory()->create(['user_id' => $user->id, 'file_path' => 'documents/mine.pdf']);
        $theirs = Document::factory()->create(['user_id' => $otherUser->id, 'file_path' => 'documents/theirs.pdf']);

        $response = $this->actingAs($user)
            ->postJson('/documents/download', ['ids' => [$mine->id, $theirs->id]]);

        $response->assertOk();

        $entries = $this->zipEntries($response->streamedContent());
        $this->assertSame(["{$mine->id}-mine.pdf"], $entries);
    }

    public function test_records_without_files_on_disk_are_rejected(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $photo = Photo::factory()->create([
            'user_id' => $user->id,
            'file_path' => 'photos/missing.jpg',
        ]);

        $this->actingAs($user)
            ->postJson('/photos/download', ['ids' => [$photo->id]])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['ids']);
    }

    public function test_unknown_ids_are_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/photos/download', ['ids' => [999999]])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['ids.0']);
    }
}
