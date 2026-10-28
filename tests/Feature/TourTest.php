<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TourTest extends TestCase
{
    use RefreshDatabase;

    public function test_finishing_the_tour_is_remembered_on_the_account(): void
    {
        $user = User::factory()->create();
        $this->assertNull($user->tour_completed_at);

        $this->actingAs($user)->postJson('/tour/complete')->assertNoContent();
        $first = $user->fresh()->tour_completed_at;
        $this->assertNotNull($first);

        // Finishing again keeps the first time.
        $this->travel(1)->days();
        $this->actingAs($user)->postJson('/tour/complete')->assertNoContent();
        $this->assertTrue($first->equalTo($user->fresh()->tour_completed_at));

        // Every page knows, so the tour doesn't start on another device.
        $this->actingAs($user)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->whereNot('auth.user.tour_completed_at', null));
    }

    public function test_guests_cannot_finish_the_tour(): void
    {
        $this->postJson('/tour/complete')->assertUnauthorized();
    }
}
