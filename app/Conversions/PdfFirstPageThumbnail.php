<?php

namespace App\Conversions;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Spatie\MediaLibrary\Conversions\Conversion;
use Spatie\MediaLibrary\Conversions\ImageGenerators\ImageGenerator;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Generates a JPEG thumbnail of a PDF's first page using Ghostscript CLI.
 *
 * This is an alternative to spatie/media-library's built-in PDF ImageGenerator,
 * which requires the Imagick PHP extension. On Windows WAMP setups without
 * Imagick, calling Ghostscript directly via CLI is a lighter-weight option.
 *
 * Requires: Ghostscript (gswin64c.exe / gs) on PATH or in a known location.
 * Auto-detection order:
 *   1. GHOSTSCRIPT_PATH env var (explicit override)
 *   2. Common Windows install paths (C:\Program Files\gs\gs*\bin\gswin64c.exe)
 *   3. PATH lookup via `where` (Windows) / `which` (Unix)
 *
 * If Ghostscript is not found, requirementsAreInstalled() returns false and
 * the conversion is silently skipped — uploads never break, the original PDF
 * stays accessible, and the frontend falls back to a PDF icon.
 */
class PdfFirstPageThumbnail extends ImageGenerator
{
    public function convert(string $file, ?Conversion $conversion = null): ?string
    {
        $pageNumber = $conversion ? ($conversion->getPdfPageNumber() ?? 1) : 1;

        $imageFile = pathinfo($file, PATHINFO_DIRNAME)
            . DIRECTORY_SEPARATOR
            . pathinfo($file, PATHINFO_FILENAME)
            . '.jpg';

        $gsBinary = $this->findGhostscript();
        if (!$gsBinary) {
            Log::warning('Ghostscript not found — PDF thumbnail conversion skipped', [
                'hint' => 'Install Ghostscript or set GHOSTSCRIPT_PATH env var',
            ]);
            return null;
        }

        try {
            // Use Imagick if available (preferred — handles PDFs natively)
            if (extension_loaded('imagick')) {
                $pdf = new \Spatie\PdfToImage\Pdf($file);
                if (method_exists($pdf, 'selectPage')) {
                    $pdf->selectPage($pageNumber)->save($imageFile);
                } else {
                    $pdf->setPage($pageNumber)->saveImage($imageFile);
                }
                return $imageFile;
            }

            // Otherwise call Ghostscript CLI directly
            $this->renderViaGhostscript($gsBinary, $file, $imageFile, $pageNumber);
            return $imageFile;
        } catch (\Throwable $e) {
            Log::warning('PDF thumbnail generation failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function requirementsAreInstalled(): bool
    {
        // If Imagick is loaded, we're good. Otherwise look for Ghostscript CLI.
        if (extension_loaded('imagick')) {
            return true;
        }
        return $this->findGhostscript() !== null;
    }

    public function supportedExtensions(): Collection
    {
        return collect(['pdf']);
    }

    public function supportedMimeTypes(): Collection
    {
        return collect(['application/pdf']);
    }

    protected function findGhostscript(): ?string
    {
        $explicit = env('GHOSTSCRIPT_PATH');
        if ($explicit && file_exists($explicit)) {
            return $explicit;
        }

        $windowsCandidates = [
            'C:\\Program Files\\gs\\gs10.07.1\\bin\\gswin64c.exe',
            'C:\\Program Files\\gs\\gs10.04.0\\bin\\gswin64c.exe',
            'C:\\Program Files\\gs\\gs10.03.0\\bin\\gswin64c.exe',
            'C:\\Program Files\\gs\\gs10.02.1\\bin\\gswin64c.exe',
            'C:\\Program Files\\gs\\gs9.56.1\\bin\\gswin64c.exe',
        ];
        foreach ($windowsCandidates as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        $candidates = ['gswin64c', 'gswin32c', 'gs'];
        foreach ($candidates as $binary) {
            $cmd = PHP_OS_FAMILY === 'Windows' ? "where $binary 2>nul" : "which $binary 2>/dev/null";
            $output = @shell_exec($cmd);
            if ($output) {
                $path = trim(explode("\n", $output)[0]);
                if ($path && file_exists($path)) {
                    return $path;
                }
            }
        }

        return null;
    }

    protected function renderViaGhostscript(string $gsBinary, string $pdfPath, string $outputPath, int $pageNumber): void
    {
        $cmd = sprintf(
            '%s -q -dNOPAUSE -dBATCH -sDEVICE=jpeg -r150 -dFirstPage=%d -dLastPage=%d -sOutputFile=%s %s 2>&1',
            escapeshellarg($gsBinary),
            $pageNumber,
            $pageNumber,
            escapeshellarg($outputPath),
            escapeshellarg($pdfPath)
        );
        exec($cmd, $output, $returnVar);
        if ($returnVar !== 0 || !file_exists($outputPath)) {
            throw new \RuntimeException('Ghostscript rendering failed: ' . implode("\n", $output));
        }
    }
}
