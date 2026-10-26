<?php

namespace App\Console\Commands;

use App\Models\Photo;
use App\Services\PhotoDateResolver;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Give photos uploaded before taken_at existed a capture time, and a content
 * hash so later uploads of the same file are recognised as duplicates.
 *
 * Runs the same resolver as new uploads over what was kept: the original
 * filename, the folder path if one was recorded, and the stored file's EXIF.
 * Photos nothing can date keep their photo_date if set, else their upload
 * time.
 *
 * Defaults to dry-run and prints what it would set; requires --yes to write.
 */
class BackfillPhotoDates extends Command
{
    protected $signature = 'photos:backfill-dates
                            {--yes : Actually write the changes (default is dry-run)}
                            {--all : Re-resolve photos that already have taken_at (manual dates are kept)}
                            {--chunk=200 : How many photos to load per query batch}';

    protected $description = 'Fill in taken_at / content_hash on existing photos from their filename, folder or EXIF';

    public function handle(PhotoDateResolver $dates): int
    {
        $write = (bool) $this->option('yes');
        $counts = [];
        $hashed = 0;

        Photo::query()
            ->when(! $this->option('all'), fn ($q) => $q->where(fn ($q) => $q->whereNull('taken_at')->orWhereNull('content_hash')))
            ->orderBy('id')
            ->chunkById((int) $this->option('chunk'), function ($photos) use ($dates, $write, &$counts, &$hashed) {
                foreach ($photos as $photo) {
                    $changes = [];
                    $localFile = $this->localPath($photo);

                    if ($photo->date_source !== PhotoDateResolver::SOURCE_MANUAL && ($this->option('all') || ! $photo->taken_at)) {
                        [$takenAt, $source] = $this->resolve($dates, $photo, $localFile);
                        $changes['taken_at'] = $takenAt;
                        $changes['date_source'] = $source;
                        $counts[$source] = ($counts[$source] ?? 0) + 1;

                        $this->line(sprintf('#%d %s → %s (%s)', $photo->id, $photo->original_name, $takenAt->format('Y-m-d H:i'), $source));
                    }

                    if (! $photo->content_hash && $localFile) {
                        $changes['content_hash'] = hash_file('sha256', $localFile);
                        $hashed++;
                    }

                    if ($write && $changes) {
                        Photo::withoutSyncingToSearch(fn () => $photo->update($changes));
                    }
                }
            });

        if (! $counts && ! $hashed) {
            $this->info('Nothing to backfill.');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->table(['Date source', 'Photos'], collect($counts)->map(fn ($n, $s) => [$s, $n])->values()->all());
        $this->line("Content hashes: {$hashed}");

        if (! $write) {
            $this->warn('Dry run. Re-run with --yes to save these dates.');
        } else {
            $this->info('Saved.');
        }

        return self::SUCCESS;
    }

    /** @return array{0: CarbonImmutable, 1: string} */
    private function resolve(PhotoDateResolver $dates, Photo $photo, ?string $localFile): array
    {
        $resolved = $dates->resolve((string) $photo->original_name, $photo->source_path, $localFile);

        if ($resolved) {
            return [$resolved['taken_at'], $resolved['source']];
        }

        // Keep a date someone already set (factory/WhatsApp rows), else fall back to when it was uploaded.
        $fallback = $photo->photo_date ?? $photo->created_at->copy()->setTimezone(config('photos.local_timezone'));

        return [CarbonImmutable::parse($fallback->format('Y-m-d H:i:s')), PhotoDateResolver::SOURCE_UPLOAD];
    }

    private function localPath(Photo $photo): ?string
    {
        if ($media = $photo->getFirstMedia('photos')) {
            $path = $media->getPath();
            if (is_file($path)) {
                return $path;
            }
        }

        $disk = Storage::disk('public');

        return $photo->file_path && $disk->exists($photo->file_path) ? $disk->path($photo->file_path) : null;
    }
}
