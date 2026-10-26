<?php

namespace App\Services;

use Carbon\CarbonImmutable;

/**
 * Works out when a photo was taken from whatever survives the trip to us.
 *
 * WhatsApp strips EXIF, and downloading from Google Drive resets file times,
 * so the date usually lives in the filename ("WhatsApp Image 2025-10-07 at
 * 20.21.35", "PHOTO-2026-01-04-10-22-31") or in the folder it was filed under
 * ("2025/October/Busia-Photos-Oct-7", "2026/June-26/Jun_22").
 *
 * Sources are tried most-reliable first; the one that answered is returned
 * alongside the time so the UI can flag guesses. Times are site-local
 * wall-clock (config('photos.local_timezone')).
 */
class PhotoDateResolver
{
    public const SOURCE_EXIF = 'exif';
    public const SOURCE_FILENAME = 'filename';
    public const SOURCE_FOLDER = 'folder';
    public const SOURCE_FOLDER_MONTH = 'folder_month';
    public const SOURCE_FILE_MODIFIED = 'file_modified';
    public const SOURCE_MANUAL = 'manual';
    public const SOURCE_UPLOAD = 'upload';

    private const MONTH = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

    /**
     * @param  string  $filename  original client filename
     * @param  string|null  $relativePath  folder path as picked, e.g. "2025/October/Busia-Photos-Oct-7/x.jpg"
     * @param  string|null  $localFile  readable copy of the file, for EXIF
     * @param  int|null  $lastModifiedMs  browser File.lastModified (epoch ms)
     * @return array{taken_at: CarbonImmutable, source: string}|null
     */
    public function resolve(string $filename, ?string $relativePath = null, ?string $localFile = null, ?int $lastModifiedMs = null): ?array
    {
        if ($localFile && ($at = $this->fromExif($localFile))) {
            return ['taken_at' => $at, 'source' => self::SOURCE_EXIF];
        }

        if ($at = $this->fromFilename($filename)) {
            return ['taken_at' => $at, 'source' => self::SOURCE_FILENAME];
        }

        $modified = $lastModifiedMs ? $this->fromTimestampMs($lastModifiedMs) : null;
        $folder = $relativePath ? $this->fromFolders($relativePath) : null;

        if ($folder && $folder['precision'] === 'day') {
            return ['taken_at' => $folder['date'], 'source' => self::SOURCE_FOLDER];
        }

        if ($folder) {
            // A month folder only gives the 1st; the file time is better when it agrees.
            if ($modified && $modified->format('Y-m') === $folder['date']->format('Y-m')) {
                return ['taken_at' => $modified, 'source' => self::SOURCE_FILE_MODIFIED];
            }

            return ['taken_at' => $folder['date'], 'source' => self::SOURCE_FOLDER_MONTH];
        }

        if ($modified) {
            return ['taken_at' => $modified, 'source' => self::SOURCE_FILE_MODIFIED];
        }

        return null;
    }

    public function fromExif(string $path): ?CarbonImmutable
    {
        if (! function_exists('exif_read_data') || ! is_readable($path)) {
            return null;
        }

        $exif = @exif_read_data($path);
        $raw = $exif['DateTimeOriginal'] ?? $exif['DateTimeDigitized'] ?? null;

        if (! is_string($raw) || ! preg_match('/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/', $raw, $m)) {
            return null;
        }

        return $this->make($m[1], $m[2], $m[3], $m[4], $m[5], $m[6]);
    }

    public function fromFilename(string $filename): ?CarbonImmutable
    {
        $name = pathinfo($filename, PATHINFO_FILENAME);

        $withTime = [
            // WhatsApp desktop / macOS: "WhatsApp Image 2025-10-07 at 20.21.35_7b3a17e0"
            '/(?<!\d)(\d{4})-(\d{2})-(\d{2}) at (\d{1,2})[.:](\d{2})[.:](\d{2})/i',
            // WhatsApp iOS export: "PHOTO-2026-06-03-09-12-06 3"
            '/PHOTO-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/i',
            // Android camera: "IMG_20250101_123456", "PXL_20250101_123456789", "20250101_123456"
            '/(?<!\d)(\d{4})(\d{2})(\d{2})[_-](\d{2})(\d{2})(\d{2})/',
            // Hand-named: "2026-07-08 BERNARD_OTIENO 21.38.02"
            '/(?<!\d)(\d{4})-(\d{2})-(\d{2})\D+?(\d{2})[.:](\d{2})[.:](\d{2})(?!\d)/',
        ];

        foreach ($withTime as $pattern) {
            if (preg_match($pattern, $name, $m) && ($at = $this->make($m[1], $m[2], $m[3], $m[4], $m[5], $m[6]))) {
                return $at;
            }
        }

        $dateOnly = [
            // WhatsApp Android: "IMG-20251007-WA0028"
            '/(?:IMG|VID)-(\d{4})(\d{2})(\d{2})-WA\d+/i',
            '/(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/',
            '/(?<!\d)(20\d{2})(\d{2})(\d{2})(?!\d)/',
        ];

        foreach ($dateOnly as $pattern) {
            if (preg_match($pattern, $name, $m) && ($at = $this->make($m[1], $m[2], $m[3]))) {
                return $at;
            }
        }

        return null;
    }

    /**
     * Read the year/month/day the folders were filed under.
     *
     * Walks shallow to deep so outer folders give context to inner ones:
     * under "2025", "Oct-25" is October 2025 but "Busia-Photos-Oct-7" is
     * the 7th. Ranges ("Jun_1-9", "Oct (11-13)") use their first day.
     *
     * @return array{date: CarbonImmutable, precision: 'day'|'month'}|null
     */
    public function fromFolders(string $relativePath): ?array
    {
        $segments = array_values(array_filter(explode('/', str_replace('\\', '/', $relativePath)), 'strlen'));
        array_pop($segments); // the file itself

        $year = $month = $day = null;

        foreach ($segments as $segment) {
            if (preg_match('/(?<!\d)(20\d{2})(?!\d)/', $segment, $y)) {
                $year = (int) $y[1];
                $month = $day = null;
            }

            if (! preg_match('/(?<![a-z])'.self::MONTH.'(?![a-z])(?:[\s_\-]*\(?\s*(\d{1,2})(?!\d))?/i', $segment, $m)) {
                continue;
            }

            $monthNumber = $this->monthNumber($m[1]);
            $number = isset($m[2]) && $m[2] !== '' ? (int) $m[2] : null;

            if ($number === null || ($year && $number === $year % 100)) {
                [$month, $day] = [$monthNumber, null];
            } elseif ($year === null) {
                [$year, $month, $day] = [2000 + $number, $monthNumber, null];
            } else {
                [$month, $day] = [$monthNumber, $number];
            }
        }

        if (! $year || ! $month) {
            return null;
        }

        if ($day && ($date = $this->make($year, $month, $day))) {
            return ['date' => $date, 'precision' => 'day'];
        }

        $date = $this->make($year, $month, 1);

        return $date ? ['date' => $date, 'precision' => 'month'] : null;
    }

    public function fromTimestampMs(int $ms): ?CarbonImmutable
    {
        $at = CarbonImmutable::createFromTimestampMs($ms)->setTimezone($this->timezone());

        return $this->inRange((int) $at->year) && $at->lessThanOrEqualTo(CarbonImmutable::now()->addDay()) ? $at : null;
    }

    /** "Now" in site-local time, the fallback when nothing else answers. */
    public function now(): CarbonImmutable
    {
        return CarbonImmutable::now($this->timezone());
    }

    private function make(int|string $y, int|string $mo, int|string $d, int|string $h = 0, int|string $mi = 0, int|string $s = 0): ?CarbonImmutable
    {
        [$y, $mo, $d, $h, $mi, $s] = array_map('intval', [$y, $mo, $d, $h, $mi, $s]);

        if (! $this->inRange($y) || ! checkdate($mo, $d, $y) || $h > 23 || $mi > 59 || $s > 59) {
            return null;
        }

        return CarbonImmutable::create($y, $mo, $d, $h, $mi, $s, $this->timezone());
    }

    private function inRange(int $year): bool
    {
        return $year >= 2000 && $year <= (int) date('Y') + 1;
    }

    private function monthNumber(string $token): int
    {
        return (int) array_search(strtolower(substr($token, 0, 3)), [
            1 => 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        ], true);
    }

    private function timezone(): string
    {
        return config('photos.local_timezone', 'Africa/Nairobi');
    }
}
