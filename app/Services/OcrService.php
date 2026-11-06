<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Self-hosted OCR using native Tesseract (Apache-2.0).
 *
 * Detection order (fastest first):
 *   1. Native Tesseract CLI — preferred. ~2-3s per receipt, no startup overhead.
 *   2. Node.js + tesseract.js worker — fallback when native isn't installed.
 *   3. OCR.space (cloud) — only if OCR_CLOUD_FALLBACK=true. Off by default
 *      because receipt data is financial and shouldn't leave the server.
 *
 * Why prefer native over tesseract.js:
 *   - 10-30x faster (no Node.js cold start, no WASM init)
 *   - Smaller memory footprint
 *   - Same accuracy (same Tesseract engine under the hood)
 *   - Supports 100+ languages with simple `-l` flag
 */
class OcrService
{
    public function __construct(
        protected ?string $workerScript = null,
        protected int $timeoutSeconds = 120,
    ) {
        $this->workerScript = $workerScript ?? base_path('ocr-worker.mjs');
    }

    /**
     * Extract text from an image or a PDF (all of a PDF's text; its first
     * pages scanned when it has none). `alternatives` holds other readings
     * of an image, when there are any.
     *
     * @return array{success: bool, text?: string, alternatives?: array<int, string>, confidence?: float, source?: string, message?: string}
     */
    public function extractText(string $absolutePath, string $language = 'eng'): array
    {
        if (!file_exists($absolutePath)) {
            return ['success' => false, 'message' => "File not found: {$absolutePath}"];
        }

        // Memoise on file CONTENT, not path: the upload preview (analyze) and
        // the write to expenses (store) read the same bytes under different
        // temp names, and that second run is exactly what this exists to skip.
        $key = $this->cacheKey($absolutePath, $language);

        if (is_array($cached = Cache::get($key))) {
            return $cached;
        }

        $result = $this->runExtraction($absolutePath, $language);

        // Failures are never cached: a transient engine or network error must
        // not pin the file as unreadable for the rest of the TTL.
        if ($result['success'] ?? false) {
            Cache::put($key, $result, now()->addDay());
        }

        return $result;
    }

    /**
     * Hand the file to whichever OCR engine is available, in preference order.
     * Reached only through extractText(), which owns caching and the guard.
     *
     * @return array{success: bool, text?: string, confidence?: float, source?: string, message?: string}
     */
    protected function runExtraction(string $absolutePath, string $language): array
    {
        if (!file_exists($absolutePath)) {
            return ['success' => false, 'message' => "File not found: {$absolutePath}"];
        }

        // PDFs: their own text when they have it (tickets, invoices made by
        // software), else their pages as images. Tesseract can't open a PDF.
        if ($this->isPdf($absolutePath)) {
            return $this->extractPdf($absolutePath, $language);
        }

        // 1. Native Tesseract CLI — fastest path
        if ($tesseract = $this->findTesseract()) {
            return $this->runNativeTesseract($tesseract, $absolutePath, $language);
        }

        // 2. Node.js tesseract.js worker — pure-JS fallback
        if ($this->nodeWorkerAvailable()) {
            return $this->runNodeWorker($absolutePath);
        }

        // 3. Cloud fallback — disabled by default for financial data sensitivity
        return $this->cloudFallback($absolutePath, $language);
    }

    /**
     * Cache key for one file's OCR output.
     *
     * A content hash rather than a path: the upload flow renames the file
     * between preview and commit, so the path key would miss on the very run
     * this exists to skip. The language is part of the key because it changes
     * the engine's output for identical bytes.
     */
    protected function cacheKey(string $absolutePath, string $language): string
    {
        $hash = @sha1_file($absolutePath);

        return 'ocr:v2:' . ($hash ?: 'path:' . md5($absolutePath)) . ':' . $language;
    }

    /**
     * Locate the tesseract binary.
     */
    protected function findTesseract(): ?string
    {
        $explicit = env('TESSERACT_PATH');
        if ($explicit && file_exists($explicit)) {
            return $explicit;
        }

        $windowsCandidates = [
            'C:\\Tesseract-OCR\\tesseract.exe',
            'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
            'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe',
        ];
        foreach ($windowsCandidates as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        try {
            $command = DIRECTORY_SEPARATOR === '\\' ? ['where', 'tesseract'] : ['which', 'tesseract'];
            $process = new Process($command);
            $process->setTimeout(5);
            $process->run();

            if ($process->isSuccessful()) {
                $path = trim(explode("\n", $process->getOutput())[0]);
                if ($path && file_exists($path)) {
                    return $path;
                }
            }
        } catch (\Throwable $e) {
            // Ignore execution errors
        }

        return null;
    }

    /**
     * Run tesseract directly over an image, twice.
     *
     * The image is enlarged and turned grey first (phone screenshots and
     * photos read far better that way), then read as a single column of
     * text (psm 4: chat bubbles, SMS screenshots, till receipts) and as one
     * uniform block (psm 6). Each reading gets different characters wrong;
     * ReceiptReader keeps whichever reading of a field is valid. `text` is
     * the first reading, `alternatives` the rest.
     */
    protected function runNativeTesseract(string $binary, string $inputPath, string $language): array
    {
        $prepared = $this->prepareImage($inputPath);

        try {
            $readings = [];
            foreach (['4', '6'] as $psm) {
                $process = new Process([$binary, $prepared ?? $inputPath, 'stdout', '-l', $language, '--psm', $psm]);
                $process->setTimeout($this->timeoutSeconds);
                $process->run();

                if (!$process->isSuccessful()) {
                    Log::warning('Native Tesseract failed', ['stderr' => $process->getErrorOutput(), 'psm' => $psm]);
                    continue;
                }
                $readings[] = trim($process->getOutput());
            }

            if ($readings === []) {
                return ['success' => false, 'message' => 'Native Tesseract failed'];
            }

            $text = $readings[0] !== '' ? $readings[0] : ($readings[1] ?? '');

            return [
                'success'      => true,
                'text'         => $text,
                'alternatives' => array_values(array_filter(array_slice($readings, 1), fn ($r) => $r !== '' && $r !== $text)),
                'confidence'   => $this->estimateConfidence($text),
                'source'       => 'native-tesseract',
            ];
        } catch (ProcessFailedException $e) {
            Log::error('Tesseract process failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => $e->getMessage()];
        } finally {
            if ($prepared) {
                @unlink($prepared);
            }
        }
    }

    /**
     * A copy of the image made for reading: at least ~1600px wide (up to 3x),
     * grey, with more contrast. Null when GD can't open it (the original is
     * read as it is).
     */
    protected function prepareImage(string $path): ?string
    {
        if (!function_exists('imagecreatefromstring')) {
            return null;
        }

        $source = @imagecreatefromstring((string) @file_get_contents($path));
        if (!$source) {
            return null;
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $scale = $width > 0 ? max(1.0, min(3.0, 1600 / $width)) : 1.0;
        $newWidth = (int) round($width * $scale);
        $newHeight = (int) round($height * $scale);

        $image = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($image, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagefilter($image, IMG_FILTER_GRAYSCALE);
        imagefilter($image, IMG_FILTER_CONTRAST, -40);

        $out = tempnam(sys_get_temp_dir(), 'ocr-') . '.png';
        $ok = imagepng($image, $out);
        imagedestroy($source);
        imagedestroy($image);

        return $ok ? $out : null;
    }

    protected function isPdf(string $path): bool
    {
        $handle = @fopen($path, 'rb');
        if (!$handle) {
            return false;
        }
        $head = (string) fread($handle, 5);
        fclose($handle);

        return $head === '%PDF-';
    }

    /**
     * Text from a PDF: its text layer (pdftotext -layout keeps columns in
     * reading order; smalot/pdfparser when poppler isn't installed), else
     * its first pages rendered and read with Tesseract (scanned PDFs).
     */
    protected function extractPdf(string $path, string $language): array
    {
        $text = $this->pdfTextLayer($path);
        if (mb_strlen(preg_replace('/\s+/', '', $text)) >= 40) {
            return [
                'success'    => true,
                'text'       => $text,
                'confidence' => 0.95,
                'source'     => 'pdf-text',
            ];
        }

        $pages = $this->renderPdfPages($path);
        $tesseract = $this->findTesseract();
        if ($pages === [] || !$tesseract) {
            foreach ($pages as $page) {
                @unlink($page);
            }

            return ['success' => false, 'message' => 'This PDF has no text to read, and it could not be turned into images to scan.'];
        }

        $texts = [];
        $alternatives = [];
        foreach ($pages as $page) {
            $result = $this->runNativeTesseract($tesseract, $page, $language);
            @unlink($page);
            if ($result['success'] ?? false) {
                $texts[] = $result['text'];
                $alternatives[] = $result['alternatives'][0] ?? $result['text'];
            }
        }

        if ($texts === []) {
            return ['success' => false, 'message' => 'Could not read the scanned PDF.'];
        }

        $text = implode("\n\n", $texts);

        return [
            'success'      => true,
            'text'         => $text,
            'alternatives' => [implode("\n\n", $alternatives)],
            'confidence'   => $this->estimateConfidence($text),
            'source'       => 'pdf-scan',
        ];
    }

    protected function pdfTextLayer(string $path): string
    {
        if ($binary = $this->findBinary('pdftotext')) {
            $process = new Process([$binary, '-layout', '-enc', 'UTF-8', $path, '-']);
            $process->setTimeout(60);
            $process->run();
            if ($process->isSuccessful() && trim($process->getOutput()) !== '') {
                return trim($process->getOutput());
            }
        }

        try {
            return trim((new \Smalot\PdfParser\Parser())->parseFile($path)->getText());
        } catch (\Throwable $e) {
            Log::info('PDF text layer unreadable: ' . $e->getMessage());

            return '';
        }
    }

    /**
     * The first pages of a PDF as PNGs (pdftoppm), for scanning.
     *
     * @return array<int, string>
     */
    protected function renderPdfPages(string $path, int $maxPages = 3): array
    {
        $binary = $this->findBinary('pdftoppm');
        if (!$binary) {
            return [];
        }

        $prefix = tempnam(sys_get_temp_dir(), 'pdfpage-');
        @unlink($prefix);
        $process = new Process([$binary, '-r', '200', '-png', '-f', '1', '-l', (string) $maxPages, $path, $prefix]);
        $process->setTimeout($this->timeoutSeconds);
        $process->run();
        if (!$process->isSuccessful()) {
            return [];
        }

        $pages = glob($prefix . '-*.png') ?: [];
        sort($pages);

        return $pages;
    }

    /** A command-line tool on PATH, or null. */
    protected function findBinary(string $name): ?string
    {
        try {
            $process = new Process(DIRECTORY_SEPARATOR === '\\' ? ['where', $name] : ['which', $name]);
            $process->setTimeout(5);
            $process->run();
            $path = trim(explode("\n", $process->getOutput())[0] ?? '');

            return $process->isSuccessful() && $path !== '' && file_exists($path) ? $path : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Rough confidence heuristic. Real Tesseract emits confidence per-word via TSV
     * output, but parsing that doubles the runtime. For now we estimate based on
     * whether the text contains expected receipt markers.
     */
    protected function estimateConfidence(string $text): float
    {
        if (empty($text)) return 0.0;
        $score = 50.0; // baseline
        // Boost for typical receipt patterns
        if (preg_match('/\d{1,3}(?:[,\.]\d{3})*(?:\.\d{2})/', $text)) $score += 15; // amount
        if (preg_match('/\b(?:sent|received|total|amount|ref|Ksh|KES|USD)\b/i', $text)) $score += 15;
        if (preg_match('/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/', $text)) $score += 10; // date
        if (preg_match('/\d{1,2}:\d{2}/', $text)) $score += 10; // time
        return min(99.0, $score);
    }

    /**
     * Check if Node.js + the tesseract.js worker are available.
     */
    protected function nodeWorkerAvailable(): bool
    {
        if (!file_exists($this->workerScript)) {
            return false;
        }
        try {
            $probe = new Process(['node', '--version']);
            $probe->setTimeout(5);
            $probe->run();
            return $probe->isSuccessful();
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Run the Node.js tesseract.js worker (slower than native but pure-JS).
     */
    protected function runNodeWorker(string $absolutePath): array
    {
        try {
            $process = new Process(['node', $this->workerScript, $absolutePath]);
            $process->setTimeout($this->timeoutSeconds);
            $process->run();

            if (!$process->isSuccessful()) {
                return $this->cloudFallback($absolutePath, 'eng');
            }

            $payload = json_decode(trim($process->getOutput()), true);
            if (!is_array($payload) || !($payload['success'] ?? false)) {
                return $this->cloudFallback($absolutePath, 'eng');
            }

            return [
                'success'    => true,
                'text'       => (string) ($payload['text'] ?? ''),
                'confidence' => (float) ($payload['confidence'] ?? 0),
                'source'     => 'node-tesseract-js',
            ];
        } catch (\Throwable $e) {
            return $this->cloudFallback($absolutePath, 'eng');
        }
    }

    /**
     * Optional cloud fallback. Disabled by default — set OCR_CLOUD_FALLBACK=true
     * in .env to keep OCR.space as a safety net during cutover.
     */
    protected function cloudFallback(string $absolutePath, string $language): array
    {
        if (!filter_var(config('ocr.cloud_fallback', false), FILTER_VALIDATE_BOOL)) {
            return [
                'success' => false,
                'message' => 'No local OCR engine found (Tesseract CLI or Node worker) and cloud fallback is disabled. Install Tesseract to enable receipt scanning.',
            ];
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->attach('file', file_get_contents($absolutePath), basename($absolutePath))
                ->post(config('ocr.api_url', 'https://api.ocr.space/parse/image'), [
                    'apikey' => config('ocr.api_key', 'helloworld'),
                    'language' => $language,
                    'isOverlayRequired' => 'false',
                    'detectOrientation' => 'true',
                    'scale' => 'true',
                    'OCREngine' => config('ocr.engine', '2'),
                ]);

            if ($response->failed()) {
                return ['success' => false, 'message' => 'OCR.space request failed: ' . $response->status()];
            }

            $result = $response->json();

            if (isset($result['IsErroredOnProcessing']) && $result['IsErroredOnProcessing'] === true) {
                return ['success' => false, 'message' => 'OCR.space error: ' . ($result['ErrorMessage'][0] ?? 'unknown')];
            }

            return [
                'success' => true,
                'text'    => $result['ParsedResults'][0]['ParsedText'] ?? '',
                'source'  => 'cloud-ocr-space',
            ];
        } catch (\Throwable $e) {
            Log::error('Cloud OCR fallback failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Cloud OCR also failed: ' . $e->getMessage()];
        }
    }
}
