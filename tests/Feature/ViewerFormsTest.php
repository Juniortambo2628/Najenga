<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Photo;
use App\Models\Project;
use App\Models\User;
use App\Support\ProjectRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Viewers aren't offered what they can't do: filing into a project, editing a record. */
class ViewerFormsTest extends TestCase
{
    use RefreshDatabase;

    private User $me;

    private Project $mine;

    private Project $viewing;

    protected function setUp(): void
    {
        parent::setUp();
        $this->me = User::factory()->create();
        $this->mine = Project::factory()->create(['client_id' => $this->me->id, 'name' => 'Mine']);
        $this->viewing = Project::factory()->create(['name' => 'Only viewing']);
        $this->viewing->users()->attach($this->me->id, ['role' => ProjectRole::VIEWER, 'accepted_at' => now()]);
    }

    public function test_create_forms_offer_only_projects_you_can_edit(): void
    {
        foreach (['/expenses/create', '/photos/create', '/documents/create', '/timeline/create'] as $url) {
            $this->actingAs($this->me)->get($url)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->has('projects', 1)
                    ->where('projects.0.name', 'Mine'));
        }
    }

    public function test_lists_still_name_every_project_you_can_see(): void
    {
        $this->actingAs($this->me)->get('/expenses')
            ->assertInertia(fn (Assert $page) => $page->has('projects', 2));
    }

    public function test_detail_pages_say_whether_you_can_edit(): void
    {
        $owner = $this->viewing->client;
        $theirs = Document::factory()->create(['user_id' => $owner->id, 'project_id' => $this->viewing->id]);
        $photo = Photo::factory()->create(['user_id' => $owner->id, 'project_id' => $this->viewing->id]);
        $own = Document::factory()->create(['user_id' => $this->me->id, 'project_id' => $this->mine->id]);

        $this->actingAs($this->me)->get("/documents/{$theirs->id}")
            ->assertOk()->assertInertia(fn (Assert $page) => $page->where('can.update', false));
        $this->actingAs($this->me)->get("/photos/{$photo->id}")
            ->assertOk()->assertInertia(fn (Assert $page) => $page->where('can.update', false));
        $this->actingAs($this->me)->get("/documents/{$own->id}")
            ->assertInertia(fn (Assert $page) => $page->where('can.update', true));
    }
}
