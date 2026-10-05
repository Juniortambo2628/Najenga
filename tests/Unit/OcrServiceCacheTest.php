<?php

namespace Tests\Unit;

use App\Services\OcrService;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * extractText() memoises on file content so the upload preview and the commit
 * to expenses share one engine run. The engine itself is stubbed out; these
 * tests only assert when the engine is reached.
 */
class OcrServiceCacheTest extends TestCase
{
    private string $path;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        $this->path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ocr-cache-' . uniqid('', true) . '.png';
    }

    protected function tearDown(): void
    {
        @unlink($this->path);

        parent::tearDown();
    }

    /**
     * An OcrService whose engine is a counter returning a fixed result.
     */
    private function fakeEngine(array $result): OcrService
    {
        return new class($result) extends OcrService {
            public int $runs = 0;

            public function __construct(private array $result)
            {
                parent::__construct();
            }

            protected function runExtraction(string $absolutePath, string $language): array
            {
                $this->runs++;

                return $this->result;
            }
        };
    }

    public function test_identical_content_is_extracted_once(): void
    {
        file_put_contents($this->path, 'same receipt bytes');

        $engine = $this->fakeEngine([
            'success'    => true,
            'text'       => 'TOTAL KES 100.00',
            'confidence' => 0.9,
            'source'     => 'fake-engine',
        ]);

        $first = $engine->extractText($this->path);
        $second = $engine->extractText($this->path);

        $this->assertSame(1, $engine->runs, 'second read must be served from cache');
        $this->assertSame($first, $second);
        $this->assertSame('TOTAL KES 100.00', $second['text']);
    }

    public function test_same_bytes_under_a_different_path_hit_the_same_entry(): void
    {
        file_put_contents($this->path, 'same receipt bytes');

        $copy = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ocr-cache-' . uniqid('', true) . '.png';
        file_put_contents($copy, 'same receipt bytes');

        $engine = $this->fakeEngine([
            'success' => true,
            'text'    => 'TOTAL KES 100.00',
        ]);

        try {
            $engine->extractText($this->path);
            $engine->extractText($copy);

            $this->assertSame(
                1,
                $engine->runs,
                'the preview and commit paths differ, so the key must be content-based'
            );
        } finally {
            @unlink($copy);
        }
    }

    public function test_different_content_is_not_shared(): void
    {
        file_put_contents($this->path, 'receipt A');

        $other = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'ocr-cache-' . uniqid('', true) . '.png';
        file_put_contents($other, 'receipt B');

        $engine = $this->fakeEngine(['success' => true, 'text' => 'A']);

        try {
            $engine->extractText($this->path);
            $engine->extractText($other);

            $this->assertSame(2, $engine->runs, 'distinct receipts must not share a cache entry');
        } finally {
            @unlink($other);
        }
    }

    public function test_failed_extraction_is_not_cached(): void
    {
        file_put_contents($this->path, 'receipt bytes');

        $engine = $this->fakeEngine([
            'success' => false,
            'message' => 'engine down',
        ]);

        $engine->extractText($this->path);
        $engine->extractText($this->path);

        $this->assertSame(2, $engine->runs, 'a failure must be retried, not pinned for the TTL');
    }

    public function test_missing_file_fails_without_reaching_the_engine(): void
    {
        $engine = $this->fakeEngine(['success' => true]);

        $result = $engine->extractText($this->path);

        $this->assertFalse($result['success']);
        $this->assertSame(0, $engine->runs);
    }
}
