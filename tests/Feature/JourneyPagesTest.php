<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class JourneyPagesTest extends TestCase
{
    public function test_the_homeowner_and_contractor_journeys_are_public_pages(): void
    {
        $this->get('/for-homeowners')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Journey')->where('journeyId', 'homeowners'));

        $this->get('/for-contractors')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Journey')->where('journeyId', 'contractors'));
    }
}
