<?php

namespace Tests\Unit;

use App\Services\OcrService;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/** PDFs are read from their own text (Tesseract can't open a PDF). */
class OcrServicePdfTest extends TestCase
{
    private string $path;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->path = sys_get_temp_dir() . '/ocr-pdf-' . uniqid('', true) . '.pdf';
    }

    protected function tearDown(): void
    {
        @unlink($this->path);
        parent::tearDown();
    }

    /** A one-page PDF with these lines of text. */
    public static function pdf(array $lines): string
    {
        $stream = "BT /F1 12 Tf 50 780 Td 16 TL\n";
        foreach ($lines as $line) {
            $stream .= '(' . str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $line) . ") Tj T*\n";
        }
        $stream .= 'ET';

        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            "<< /Length " . strlen($stream) . " >>\nstream\n{$stream}\nendstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $i => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1) . " 0 obj\n{$object}\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }
        $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";

        return $pdf;
    }

    public function test_a_pdf_is_read_from_its_own_text(): void
    {
        file_put_contents($this->path, self::pdf([
            'Mwangi Building Supplies Ltd',
            'Tax invoice',
            'Invoice no: INV-00123',
            'Grand total: KES 18,400.00',
        ]));

        $result = (new OcrService())->extractText($this->path);

        $this->assertTrue($result['success']);
        $this->assertSame('pdf-text', $result['source']);
        $this->assertStringContainsString('INV-00123', $result['text']);
        $this->assertStringContainsString('18,400.00', $result['text']);
    }

    public function test_a_pdf_with_no_text_and_no_way_to_scan_it_says_so(): void
    {
        file_put_contents($this->path, self::pdf([]));

        $ocr = new class extends OcrService {
            protected function renderPdfPages(string $path, int $maxPages = 3): array
            {
                return [];
            }
        };
        $result = $ocr->extractText($this->path);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('no text', $result['message']);
    }
}
