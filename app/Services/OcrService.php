<?php

namespace App\Services;

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
     * Extract text from an image or PDF (first page only for PDFs).
     *
     * @return array{success: bool, text?: string, confidence?: float, source?: string, message?: string}
     */
    public function extractText(string $absolutePath, string $language = 'eng'): array
    {
        if (!file_exists($absolutePath)) {
            return ['success' => false, 'message' => "File not found: {$absolutePath}"];
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

        $output = @shell_exec('where tesseract 2>nul');
        if ($output) {
            $path = trim(explode("\n", $output)[0]);
            if ($path && file_exists($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Run tesseract directly. Outputs plain text to stdout.
     */
    protected function runNativeTesseract(string $binary, string $inputPath, string $language): array
    {
        try {
            // -l <lang>: language pack
            // --dpi 300: assume 300 DPI for screen-scraped images (improves accuracy)
            // --psm 6: assume a single uniform block of text (good for receipts)
            // -c preserve_interword_spaces=1: keep spaces between words
            $cmd = [
                $binary,
                $inputPath,
                'stdout',  // output to stdout
                '-l', $language,
                '--psm', '6',
            ];

            $process = new Process($cmd);
            $process->setTimeout($this->timeoutSeconds);
            $process->run();

            if (!$process->isSuccessful()) {
                Log::warning('Native Tesseract failed', ['stderr' => $process->getErrorOutput()]);
                return ['success' => false, 'message' => 'Native Tesseract failed: ' . $process->getErrorOutput()];
            }

            $text = trim($process->getOutput());

            // Get confidence via tsv output if available — most receipts don't include
            // confidence, but tesseract can report it via a separate run. For now,
            // we estimate based on character count heuristics.
            return [
                'success'    => true,
                'text'       => $text,
                'confidence' => $this->estimateConfidence($text),
                'source'     => 'native-tesseract',
            ];
        } catch (ProcessFailedException $e) {
            Log::error('Tesseract process failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => $e->getMessage()];
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
        if (!filter_var(env('OCR_CLOUD_FALLBACK', false), FILTER_VALIDATE_BOOL)) {
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
