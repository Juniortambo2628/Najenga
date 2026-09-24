<?php

namespace App\Console\Commands;

use App\Models\Photo;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Find and (with --yes) delete Photo rows whose file_path no longer resolves
 * on the public disk. This surfaces after backups, folder moves, or files
 * being deleted outside the app — the DB row hangs around and the gallery
 * tries to render an <img src> that 404s.
 *
 * Defaults to dry-run and prints the list of orphans; requires --yes to
 * actually delete anything.
 */
class PrunePhotosMissingFile extends Command
{
    protected $signature = 'photos:prune-missing
                            {--yes : Actually delete the orphan rows (default is dry-run)}
                            {--chunk=200 : How many photos to load per query batch}';

    protected $description = 'List (and optionally delete) Photo rows whose file_path is missing on the public disk';

    public function handle(): int
    {
        $disk = Storage::disk('public');
        $orphans = collect();
        $checked = 0;

        Photo::query()
            ->whereNotNull('file_path')
            ->orderBy('id')
            ->chunkById((int) $this->option('chunk'), function ($photos) use ($disk, &$orphans, &$checked) {
                foreach ($photos as $p) {
                    $checked++;
                    if (! $disk->exists((string) $p->file_path)) {
                        $orphans->push($p);
                    }
                }
            });

        $this->info("Checked {$checked} photos.");
        $this->info("Orphans: {$orphans->count()}");

        if ($orphans->isEmpty()) {
            return self::SUCCESS;
        }

        foreach ($orphans as $p) {
            $this->line("  #{$p->id}\t".($p->title ?: '(untitled)').' — '.$p->file_path);
        }

        if (! $this->option('yes')) {
            $this->comment('Dry run. Re-run with --yes to delete these rows.');
            return self::SUCCESS;
        }

        $deleted = 0;
        foreach ($orphans as $p) {
            $p->delete();
            $deleted++;
        }
        $this->info("Deleted {$deleted} orphan Photo row(s).");

        return self::SUCCESS;
    }
}
