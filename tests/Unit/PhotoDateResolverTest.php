<?php

namespace Tests\Unit;

use App\Services\PhotoDateResolver;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Names and folders below are real ones from the Photos/2025 and
 * Photos/2026 Drive folders the uploader was built for.
 */
class PhotoDateResolverTest extends TestCase
{
    private PhotoDateResolver $resolver;

    protected function setUp(): void
    {
        parent::setUp();
        $this->resolver = new PhotoDateResolver;
    }

    public static function filenames(): array
    {
        return [
            'whatsapp desktop' => ['WhatsApp Image 2025-10-07 at 20.21.35_7b3a17e0.jpg', '2025-10-07 20:21:35'],
            'whatsapp desktop copy' => ['WhatsApp Image 2026-07-31 at 11.32.01 (1).jpeg', '2026-07-31 11:32:01'],
            'whatsapp video' => ['WhatsApp Video 2025-02-16 at 20.01.01_504fd24d.mp4', '2025-02-16 20:01:01'],
            'ios export' => ['PHOTO-2026-06-03-09-12-06 3.jpg', '2026-06-03 09:12:06'],
            'ios export double ext' => ['PHOTO-2026-07-30-14-15-40.jpg.jpeg', '2026-07-30 14:15:40'],
            'android whatsapp' => ['IMG-20251007-WA0028.jpg', '2025-10-07 00:00:00'],
            'android camera' => ['IMG_20250101_123456.jpg', '2025-01-01 12:34:56'],
            'pixel camera' => ['PXL_20250304_081500123.jpg', '2025-03-04 08:15:00'],
            'hand named' => ['2026-07-08 BERNARD_OTIENO 21.38.02.jpeg', '2026-07-08 21:38:02'],
        ];
    }

    #[DataProvider('filenames')]
    public function test_reads_date_from_filename(string $name, string $expected): void
    {
        $this->assertSame($expected, $this->resolver->fromFilename($name)?->format('Y-m-d H:i:s'));
    }

    public function test_ignores_names_without_a_date(): void
    {
        $this->assertNull($this->resolver->fromFilename('0294f9e1-4669-44d2-9383-dfb6e8e88eba.jpg'));
        $this->assertNull($this->resolver->fromFilename('logo-1-white-bg.png'));
        $this->assertNull($this->resolver->fromFilename('IMG-20251399-WA0001.jpg'));
    }

    public static function folders(): array
    {
        return [
            'day folder' => ['Photos/2025/October/Busia-Photos-Oct-7/x.jpg', '2025-10-07', 'day'],
            'day range in parens' => ['2025/October/Busia-Photos-Oct (11-13)/x.jpg', '2025-10-11', 'day'],
            'day range' => ['2025/October/Busia-Photos-Oct-11-13/x.jpg', '2025-10-11', 'day'],
            'month-year under year' => ['2026/June-26/Jun_22/x.jpg', '2026-06-22', 'day'],
            'underscore range' => ['2026/June-26/Jun_1-9/x.jpg', '2026-06-01', 'day'],
            'sept day' => ['2025/Aug-Sep/Busia-Photos-Sep-29/x.jpg', '2025-09-29', 'day'],
            'month name only' => ['Photos/2025/March/x.jpg', '2025-03-01', 'month'],
            'month-yy matches year' => ['2025/Oct-25/x.jpg', '2025-10-01', 'month'],
            'two months' => ['2025/Aug-Sep/x.jpg', '2025-08-01', 'month'],
            'no year folder' => ['June-26/Jun_22/x.jpg', '2026-06-22', 'day'],
            'month-yy alone' => ['Jan-26/x.jpg', '2026-01-01', 'month'],
        ];
    }

    #[DataProvider('folders')]
    public function test_reads_date_from_folders(string $path, string $date, string $precision): void
    {
        $result = $this->resolver->fromFolders($path);

        $this->assertNotNull($result);
        $this->assertSame($date, $result['date']->toDateString());
        $this->assertSame($precision, $result['precision']);
    }

    public function test_folders_without_a_month_give_nothing(): void
    {
        $this->assertNull($this->resolver->fromFolders('Photos/2025/x.jpg'));
        $this->assertNull($this->resolver->fromFolders('Market/Marble/x.jpg'));
        $this->assertNull($this->resolver->fromFolders('x.jpg'));
    }

    public function test_filename_beats_folder(): void
    {
        $result = $this->resolver->resolve('WhatsApp Image 2026-06-21 at 18.00.00.jpeg', '2026/June-26/Jun_22/WhatsApp Image 2026-06-21 at 18.00.00.jpeg');

        $this->assertSame(PhotoDateResolver::SOURCE_FILENAME, $result['source']);
        $this->assertSame('2026-06-21 18:00:00', $result['taken_at']->format('Y-m-d H:i:s'));
    }

    public function test_folder_day_used_when_filename_has_no_date(): void
    {
        $result = $this->resolver->resolve('site.jpg', '2025/October/Busia-Photos-Oct-7/site.jpg');

        $this->assertSame(PhotoDateResolver::SOURCE_FOLDER, $result['source']);
        $this->assertSame('2025-10-07', $result['taken_at']->toDateString());
    }

    public function test_file_time_refines_a_month_folder_only_when_it_agrees(): void
    {
        $inMonth = CarbonImmutable::create(2026, 1, 4, 10, 0, 0, 'Africa/Nairobi')->getTimestampMs();
        $later = CarbonImmutable::create(2026, 10, 26, 10, 0, 0, 'Africa/Nairobi')->getTimestampMs();

        $agrees = $this->resolver->resolve('a.jpg', '2026/Jan-26/a.jpg', null, $inMonth);
        $this->assertSame(PhotoDateResolver::SOURCE_FILE_MODIFIED, $agrees['source']);
        $this->assertSame('2026-01-04 10:00', $agrees['taken_at']->format('Y-m-d H:i'));

        $disagrees = $this->resolver->resolve('a.jpg', '2026/Jan-26/a.jpg', null, $later);
        $this->assertSame(PhotoDateResolver::SOURCE_FOLDER_MONTH, $disagrees['source']);
        $this->assertSame('2026-01-01', $disagrees['taken_at']->toDateString());
    }

    public function test_file_time_is_converted_to_site_local_time(): void
    {
        // 17:21:36 UTC is 20:21:36 in Nairobi, matching the WhatsApp filename.
        $ms = CarbonImmutable::create(2025, 10, 7, 17, 21, 36, 'UTC')->getTimestampMs();

        $this->assertSame('2025-10-07 20:21:36', $this->resolver->fromTimestampMs($ms)->format('Y-m-d H:i:s'));
    }

    public function test_nothing_known_returns_null(): void
    {
        $this->assertNull($this->resolver->resolve('logo.png'));
    }
}
