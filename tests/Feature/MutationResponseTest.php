<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Every mutation in this app is reachable from two sides of the same URL:
 *
 *   - axios sends `Accept: application/json` and reads a JSON body;
 *   - Inertia (router.post/patch/delete) sends `X-Inertia: true`, expects a
 *     302 back to the referrer and reads the flash message.
 *
 * Getting it wrong is silent: a JSON body to Inertia raises Inertia's "invalid
 * response" modal instead of saving, and a redirect to axios saves the row but
 * hands the caller a page of HTML.
 */
class MutationResponseTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'client']);
        $this->project = Project::factory()->create(['client_id' => $this->user->id]);
    }

    /** The headers an Inertia visit actually sends. */
    private function inertia()
    {
        return $this->actingAs($this->user)
            ->withHeaders(['X-Inertia' => 'true', 'Accept' => 'text/html']);
    }

    private function expense(): Expense
    {
        return Expense::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);
    }

    public function test_json_caller_updating_an_expense_gets_json(): void
    {
        $expense = $this->expense();

        $this->actingAs($this->user)
            ->patchJson("/expenses/{$expense->id}", ['title' => 'Renamed'])
            ->assertOk()
            ->assertJson(['success' => true, 'message' => 'Expense updated successfully']);

        $this->assertDatabaseHas('expenses', ['id' => $expense->id, 'title' => 'Renamed']);
    }

    public function test_inertia_caller_updating_an_expense_gets_a_redirect_and_flash(): void
    {
        $expense = $this->expense();

        $this->inertia()
            ->patch("/expenses/{$expense->id}", ['title' => 'Renamed'])
            ->assertRedirect()
            ->assertSessionHas('success', 'Expense updated successfully');

        $this->assertDatabaseHas('expenses', ['id' => $expense->id, 'title' => 'Renamed']);
    }

    public function test_json_caller_updating_a_photo_gets_json(): void
    {
        $photo = Photo::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->patchJson("/photos/{$photo->id}", ['title' => 'Renamed'])
            ->assertOk()
            ->assertJson(['success' => true, 'message' => 'Photo updated successfully']);

        $this->assertDatabaseHas('photos', ['id' => $photo->id, 'title' => 'Renamed']);
    }

    public function test_inertia_caller_updating_a_photo_gets_a_redirect_and_flash(): void
    {
        $photo = Photo::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->inertia()
            ->patch("/photos/{$photo->id}", ['title' => 'Renamed'])
            ->assertRedirect()
            ->assertSessionHas('success', 'Photo updated successfully');

        $this->assertDatabaseHas('photos', ['id' => $photo->id, 'title' => 'Renamed']);
    }

    public function test_json_accept_header_does_not_sway_an_inertia_visit(): void
    {
        // The second half of the rule: X-Inertia wins over what the client says
        // it accepts, otherwise a visit could still be handed a JSON body.
        $photo = Photo::factory()->create([
            'user_id' => $this->user->id,
            'project_id' => $this->project->id,
        ]);

        $this->actingAs($this->user)
            ->withHeaders(['X-Inertia' => 'true', 'Accept' => 'application/json'])
            ->patch("/photos/{$photo->id}", ['title' => 'Renamed'])
            ->assertRedirect()
            ->assertSessionHas('success', 'Photo updated successfully');
    }

    public function test_inertia_photo_upload_redirects_instead_of_returning_json(): void
    {
        Storage::fake('public');

        $this->inertia()
            ->post('/photos', [
                'photos' => [UploadedFile::fake()->image('site-plan.jpg')],
                'project_id' => $this->project->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Photos uploaded successfully');

        $this->assertDatabaseHas('photos', ['project_id' => $this->project->id]);
    }

    public function test_json_photo_upload_still_returns_json(): void
    {
        Storage::fake('public');

        $this->actingAs($this->user)
            ->post('/photos', [
                'photos' => [UploadedFile::fake()->image('site-plan.jpg')],
                'project_id' => $this->project->id,
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonStructure(['message', 'photos']);
    }

    public function test_inertia_document_upload_redirects_instead_of_returning_json(): void
    {
        Storage::fake('public');

        $this->inertia()
            ->post('/documents', [
                // A text file on purpose: the response shape is what is under
                // test, and PDFs run Spatie's image conversions, which are far
                // too heavy for the test memory limit.
                'documents' => [UploadedFile::fake()->createWithContent('site-notes.txt', "Scope of works\n")],
                'project_id' => $this->project->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Documents uploaded successfully');

        $this->assertDatabaseHas('documents', ['project_id' => $this->project->id]);
    }

    public function test_upload_without_a_project_is_an_error_flash_not_a_modal(): void
    {
        Storage::fake('public');

        $userWithoutProject = User::factory()->create(['role' => 'client']);

        $this->actingAs($userWithoutProject)
            ->withHeaders(['X-Inertia' => 'true', 'Accept' => 'text/html'])
            ->post('/photos', [
                'photos' => [UploadedFile::fake()->image('site-plan.jpg')],
            ])
            ->assertRedirect()
            ->assertSessionHas('error', 'Please create a project first before uploading photos.');
    }

    public function test_json_caller_creating_a_project_still_gets_the_model(): void
    {
        $this->actingAs($this->user)
            ->postJson('/projects', [
                'name' => 'JSON Project',
                'status' => 'active',
                'start_date' => '2026-01-01',
                'end_date' => '2026-12-31',
                'budget' => 500000,
                'currency' => 'KES',
                'location' => 'Nairobi',
            ])
            ->assertStatus(201)
            ->assertJsonFragment(['name' => 'JSON Project']);
    }
}
