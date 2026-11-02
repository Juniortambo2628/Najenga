<?php

namespace Tests\Support;

use Illuminate\Support\Arr;
use Illuminate\Testing\Fluent\AssertableJson;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Assert as PHPUnit;

/**
 * Fluent assertions on a page of the app (App\Http\Page), as
 * Inertia's AssertableInertia gave them: ->component(), ->url(),
 * ->version(), and AssertableJson's where/has/count/first on the props.
 *
 *   $this->get('/expenses')->assertPage(fn (AssertablePage $page) => $page
 *       ->component('Expenses')
 *       ->has('expenses', 3));
 */
class AssertablePage extends AssertableJson
{
    private string $component = '';

    private string $url = '';

    private ?string $version = null;

    /** The page object a response carries: JSON for the app, or inside the HTML for a browser. */
    public static function pageOf(TestResponse $response): array
    {
        $json = json_decode((string) $response->getContent(), true);
        if (is_array($json) && isset($json['component'])) {
            return $json;
        }

        $response->assertViewHas('page');

        return json_decode(json_encode($response->viewData('page')), true);
    }

    public static function fromTestResponse(TestResponse $response): self
    {
        $page = static::pageOf($response);

        PHPUnit::assertIsArray($page);
        foreach (['component', 'props', 'url', 'version'] as $key) {
            PHPUnit::assertArrayHasKey($key, $page);
        }

        $instance = static::fromArray($page['props']);
        $instance->component = $page['component'];
        $instance->url = $page['url'];
        $instance->version = $page['version'];

        return $instance;
    }

    /** The page's component; and that resources/js/Pages has it. */
    public function component(?string $value = null, bool $shouldExist = true): self
    {
        PHPUnit::assertSame($value, $this->component, 'Unexpected page component.');

        if ($shouldExist) {
            PHPUnit::assertFileExists(base_path("resources/js/Pages/{$value}.jsx"), "Page component file [{$value}] does not exist.");
        }

        return $this;
    }

    public function url(string $value): self
    {
        PHPUnit::assertSame($value, $this->url, 'Unexpected page URL.');

        return $this;
    }

    public function version(string $value): self
    {
        PHPUnit::assertSame($value, $this->version, 'Unexpected page version.');

        return $this;
    }

    /** @return array{component: string, props: array<string, mixed>, url: string, version: ?string} */
    public function toArray(): array
    {
        return ['component' => $this->component, 'props' => $this->prop(), 'url' => $this->url, 'version' => $this->version];
    }
}
