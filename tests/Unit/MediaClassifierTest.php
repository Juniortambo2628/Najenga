<?php

namespace Tests\Unit;

use App\Services\MediaClassifier;
use PHPUnit\Framework\TestCase;

class MediaClassifierTest extends TestCase
{
    private MediaClassifier $classifier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->classifier = new MediaClassifier();
    }

    public function test_video_message_is_progress_video(): void
    {
        $r = $this->classifier->classify(['media_type' => 'video']);
        $this->assertSame('progress_video', $r['class']);
        $this->assertTrue($r['auto_file']);
    }

    public function test_image_without_text_is_progress_photo(): void
    {
        $r = $this->classifier->classify(['media_type' => 'image', 'ocr_text' => '']);
        $this->assertSame('progress_photo', $r['class']);
    }

    public function test_ncba_debit_sms_is_payment_sms(): void
    {
        $text = "Your account 648****019 has been debited with KES 110,500.00 on 08/09/2026 at 09:10 for Kisoko materials. Bank Ref: FTX26251KBTJA. For queries, call 0711056444 / 0732156444 or WhatsApp: 0717804444";
        $r = $this->classifier->classify(['media_type' => 'image', 'ocr_text' => $text]);
        $this->assertSame('payment_sms', $r['class']);
        $this->assertGreaterThanOrEqual(0.7, $r['confidence']);
        $this->assertSame(110500.0, $r['extracted']['amount']);
        $this->assertSame('FTX26251KBTJA', $r['extracted']['reference_number']);
    }

    public function test_mpesa_paybill_transfer_is_payment_sms(): void
    {
        $text = "Mpesa Paybill transfer of KES 110500.00 to IM BANK C2B BANK REF. FTX26251KBTJA MPESA REF. UI8SG6DDPR was successful. NCBA, Go for it.";
        $r = $this->classifier->classify(['media_type' => 'image', 'ocr_text' => $text]);
        $this->assertSame('payment_sms', $r['class']);
        $this->assertSame(110500.0, $r['extracted']['amount']);
    }

    public function test_cost_request_text(): void
    {
        $text = "Hi, we have received the last 5 loads of Murram @ 30,000 per load. We need to pay 5×30,000 = 150,000. Stephen Egesa : 0703406205";
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => $text]);
        $this->assertSame('cost_request', $r['class']);
        $this->assertSame(150000.0, $r['extracted']['amount']);
        $this->assertSame('0703406205', $r['extracted']['phone']);
    }

    public function test_supplier_invoice_ocr(): void
    {
        $text = "KISOKO MATERIALS\nINVOICE #INV-4421\nDate: 08/09/2026\nBILL TO: Najenga\nCement bags ......... 45,000\nMurram loads ........ 60,000\nSteel bars .......... 5,500\nGRAND TOTAL: KES 110,500\nDUE DATE: 15/09/2026";
        $r = $this->classifier->classify(['media_type' => 'image', 'ocr_text' => $text]);
        $this->assertSame('invoice', $r['class']);
        $this->assertSame(110500.0, $r['extracted']['amount']);
    }

    public function test_chit_chat_text(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'Hi, how are you doing today?']);
        $this->assertSame('chit_chat', $r['class']);
    }
}
