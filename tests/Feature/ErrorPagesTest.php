<?php

namespace Tests\Feature;

use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    public function test_unknown_route_renders_the_custom_404_page(): void
    {
        $response = $this->get('/definitely-not-a-route');

        $response->assertStatus(404);
        $response->assertSee('Page not found');
        $response->assertSee('Back to home');
    }

    public function test_404_page_does_not_expose_a_stack_trace(): void
    {
        $response = $this->get('/definitely-not-a-route');

        $response->assertDontSee('Whoops');
        $response->assertDontSee('Stack trace');
    }

    public function test_403_page_shows_the_abort_message(): void
    {
        $html = view('errors.403', [
            'exception' => new HttpException(403, 'Unauthorized. Admin access required.'),
        ])->render();

        $this->assertStringContainsString('Access denied', $html);
        $this->assertStringContainsString('Unauthorized. Admin access required.', $html);
    }

    public function test_403_page_falls_back_when_there_is_no_message(): void
    {
        $html = view('errors.403', [
            'exception' => new HttpException(403),
        ])->render();

        $this->assertStringContainsString('You do not have permission to view this page.', $html);
    }

    public function test_every_status_page_renders_without_vite(): void
    {
        $headings = [
            403 => 'Access denied',
            404 => 'Page not found',
            419 => 'Session expired',
            500 => 'Something went wrong',
            503 => 'Maintenance in progress',
        ];

        foreach ($headings as $status => $heading) {
            $html = view("errors.{$status}", [
                'exception' => new HttpException($status),
            ])->render();

            $this->assertStringContainsString($heading, $html, "errors.{$status} is missing its heading.");
            $this->assertStringContainsString('Back to home', $html, "errors.{$status} is missing the home link.");
            // The page must be self-contained so it still renders when the build is broken.
            $this->assertStringNotContainsString('/build/assets/', $html, "errors.{$status} must not depend on Vite.");
        }
    }
}
