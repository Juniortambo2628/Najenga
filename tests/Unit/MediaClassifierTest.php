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

    // ---------------------------------------------------------------
    // Real-world M-PESA confirmations
    // ---------------------------------------------------------------

    public function test_forwarded_mpesa_send_money_text_is_payment_not_cost_request(): void
    {
        // Every M-PESA confirmation mentions "balance", which used to trip the
        // cost_request keyword check, and the balance / daily-limit figures were
        // larger than the amount actually sent.
        $text = "SJ12ABC3DE Confirmed. Ksh5,000.00 sent to JOHN KAMAU 0712345678 on 8/9/26 at 10:15 AM. New M-PESA balance is Ksh45,300.00. Transaction cost, Ksh13.00. Amount you can transact within the day is 494,987.00. Download new M-PESA app & get 500MB FREE data.";
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => $text]);
        $this->assertSame('payment_sms', $r['class']);
        $this->assertTrue($r['auto_file']);
        $this->assertSame(5000.0, $r['extracted']['amount']);
        $this->assertSame('SJ12ABC3DE', $r['extracted']['reference_number']);
        $this->assertSame('JOHN KAMAU', $r['extracted']['recipient']);
        $this->assertSame('0712345678', $r['extracted']['phone']);
        $this->assertSame('2026-09-08', $r['extracted']['date']);
    }

    public function test_mpesa_buy_goods_screenshot_uses_paid_amount_not_balance(): void
    {
        $text = "TIK7M2QX9P Confirmed. Ksh1,200.00 paid to MUGO HARDWARE. on 9/9/26 at 3:02 PM.New M-PESA balance is Ksh44,100.00. Transaction cost, Ksh0.00. Amount you can transact within the day is 498,800.00.";
        $r = $this->classifier->classify(['media_type' => 'image', 'ocr_text' => $text]);
        $this->assertSame('payment_sms', $r['class']);
        $this->assertSame(1200.0, $r['extracted']['amount']);
        $this->assertSame('TIK7M2QX9P', $r['extracted']['reference_number']);
        $this->assertSame('MUGO HARDWARE', $r['extracted']['recipient']);
    }

    public function test_mpesa_paybill_for_account_extracts_recipient_and_amount(): void
    {
        $text = "UIB3K8LM2N Confirmed. Ksh3,500.00 sent to KPLC PREPAID for account 54321678901 on 10/9/26 at 7:45 AM New M-PESA balance is Ksh40,600.00. Transaction cost, Ksh0.00.";
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => $text]);
        $this->assertSame('payment_sms', $r['class']);
        $this->assertSame(3500.0, $r['extracted']['amount']);
        $this->assertSame('KPLC PREPAID', $r['extracted']['recipient']);
    }

    public function test_mpesa_money_received_text_is_payment_sms(): void
    {
        $text = "UIC9D4FG7H Confirmed.You have received Ksh25,000.00 from JANE WANJIKU 0722000111 on 11/9/26 at 9:30 AM  New M-PESA balance is Ksh65,600.00. Separate personal and business funds through Pochi la Biashara on *334#.";
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => $text]);
        $this->assertSame('payment_sms', $r['class']);
        $this->assertSame(25000.0, $r['extracted']['amount']);
        $this->assertSame('UIC9D4FG7H', $r['extracted']['reference_number']);
    }

    public function test_swahili_mpesa_confirmation_is_payment_sms(): void
    {
        $text = "UID2H6JK4L Imethibitishwa. Ksh7,500.00 imetumwa kwa PETER OTIENO 0733111222 tarehe 12/9/26 saa 2:15 PM. Salio lako jipya la M-PESA ni Ksh58,100.00. Gharama ya matumizi ni Ksh87.00.";
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => $text]);
        $this->assertSame('payment_sms', $r['class']);
        $this->assertSame(7500.0, $r['extracted']['amount']);
        $this->assertSame('UID2H6JK4L', $r['extracted']['reference_number']);
        $this->assertSame('PETER OTIENO', $r['extracted']['recipient']);
    }

    public function test_mpesa_balance_enquiry_has_no_payment_amount(): void
    {
        $text = "UIE5M1NP8Q Confirmed. Your account balance was: M-PESA Account : Ksh58,100.00 on 12/9/26 at 6:00 PM. Transaction cost, Ksh0.00.";
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => $text]);
        // No money moved - must not become a cost request or a KES 58,100 expense
        $this->assertSame('chit_chat', $r['class']);
        $this->assertNull($r['extracted']['amount'] ?? null);
    }

    // ---------------------------------------------------------------
    // Paper receipts vs invoices
    // ---------------------------------------------------------------

    public function test_handwritten_receipt_book_is_receipt_not_payment_sms(): void
    {
        // Uppercase words like "SHILLINGS" used to be read as M-PESA refs.
        $text = "RECEIPT No. 0452\nDate: 10/09/2026\nRECEIVED FROM: NAJENGA LTD\nTHE SUM OF SHILLINGS: FIFTY THOUSAND ONLY\nBEING PAYMENT OF: RIVER SAND 5 LORRIES\nKSh 50,000/=\nCASH/CHEQUE No: CASH\nSIGNED: STEPHEN";
        $r = $this->classifier->classify(['media_type' => 'image', 'ocr_text' => $text]);
        $this->assertSame('receipt_paper', $r['class']);
        $this->assertTrue($r['auto_file']);
        $this->assertSame(50000.0, $r['extracted']['amount']);
        $this->assertNull($r['extracted']['reference_number']);
    }

    public function test_etr_till_receipt_is_receipt_and_uses_total_not_cash_tendered(): void
    {
        // "CU INVOICE NO" + "SUB TOTAL" used to push ETR receipts into invoice.
        $text = "MUGO HARDWARE LTD\nPIN: P051234567X\nCASH SALE\nCEMENT 50KG x3      2,550.00\nNAILS 4\" x2kg       1,800.00\nSUB TOTAL           4,350.00\nTOTAL               4,350.00\nCASH                5,000.00\nCHANGE                650.00\nCU SERIAL NO: KRAMW017202207034567\nCU INVOICE NO: 0170345670000012345\nDATE: 09/09/2026 14:32\nTHANK YOU, SERVED BY: JANE";
        $r = $this->classifier->classify(['media_type' => 'image', 'ocr_text' => $text]);
        $this->assertSame('receipt_paper', $r['class']);
        $this->assertTrue($r['auto_file']);
        $this->assertSame(4350.0, $r['extracted']['amount']);
        $this->assertSame('2026-09-09', $r['extracted']['date']);
    }

    public function test_quotation_pdf_is_invoice_with_iso_date_and_no_bogus_reference(): void
    {
        $text = "BUILDRITE SUPPLIES LTD\nQUOTATION\nQuote No: Q-2231\nDate: 2026-09-08\nCUSTOMER: NAJENGA LTD\nMACHINE CUT STONES 9x9  1,000 pcs @ 65   65,000.00\nTRANSPORT                               8,000.00\nSUBTOTAL                               73,000.00\nVAT 16%                                11,680.00\nTOTAL                                  84,680.00\nValid until 30/09/2026. Payment terms: 50% deposit.";
        $r = $this->classifier->classify(['media_type' => 'document', 'mime' => 'application/pdf', 'ocr_text' => $text]);
        $this->assertSame('invoice', $r['class']);
        $this->assertSame(84680.0, $r['extracted']['amount']);
        $this->assertSame('2026-09-08', $r['extracted']['date']);
        $this->assertNull($r['extracted']['reference_number']);
    }

    public function test_foreign_currency_invoice_keeps_currency(): void
    {
        $text = "INVOICE\nInvoice No: 7781\nBill To: Najenga Ltd\nSolar inverter 5kVA\nTOTAL USD 1,250.00\nDue date: 30/09/2026";
        $r = $this->classifier->classify(['media_type' => 'document', 'ocr_text' => $text]);
        $this->assertSame('invoice', $r['class']);
        $this->assertSame(1250.0, $r['extracted']['amount']);
        $this->assertSame('USD', $r['extracted']['currency']);
    }

    // ---------------------------------------------------------------
    // Media without financial content
    // ---------------------------------------------------------------

    public function test_photo_with_plain_caption_is_auto_filed_progress_photo(): void
    {
        $r = $this->classifier->classify(['media_type' => 'image', 'text' => 'Foundation slab done today', 'ocr_text' => '']);
        $this->assertSame('progress_photo', $r['class']);
        $this->assertTrue($r['auto_file']);
    }

    public function test_voice_note_and_sticker_are_not_progress_photos(): void
    {
        foreach (['audio', 'sticker', 'location'] as $type) {
            $r = $this->classifier->classify(['media_type' => $type, 'text' => '', 'ocr_text' => '']);
            $this->assertSame('chit_chat', $r['class'], $type);
        }
    }

    public function test_unreadable_document_is_not_auto_filed_as_photo(): void
    {
        $r = $this->classifier->classify(['media_type' => 'document', 'mime' => 'application/pdf', 'ocr_text' => '']);
        $this->assertNotSame('progress_photo', $r['class']);
        $this->assertFalse($r['auto_file']);
    }

    public function test_site_signage_ocr_is_progress_photo(): void
    {
        $r = $this->classifier->classify(['media_type' => 'image', 'ocr_text' => "PRIVATE PROPERTY\nEXCAVATION IN PROGRESS\nSUPERVISOR STEPHEN"]);
        $this->assertSame('progress_photo', $r['class']);
        $this->assertNull($r['extracted']['reference_number']);
    }

    // ---------------------------------------------------------------
    // Cost requests in the way people actually type them
    // ---------------------------------------------------------------

    public function test_cost_request_with_slash_equals_amount(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'Fundi wants 15000/= for the plumbing works, please send today']);
        $this->assertSame('cost_request', $r['class']);
        $this->assertTrue($r['auto_file']);
        $this->assertSame(15000.0, $r['extracted']['amount']);
    }

    public function test_cost_request_with_k_shorthand(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'Need 50k for cement tomorrow']);
        $this->assertSame('cost_request', $r['class']);
        $this->assertSame(50000.0, $r['extracted']['amount']);
    }

    public function test_cost_request_with_kshs_and_no_separator(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'Kshs.8500 for transport is still pending']);
        $this->assertSame('cost_request', $r['class']);
        $this->assertSame(8500.0, $r['extracted']['amount']);
    }

    public function test_bare_amount_after_need(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'We need 45000 for the roofing nails by 2026 end of month']);
        $this->assertSame('cost_request', $r['class']);
        $this->assertSame(45000.0, $r['extracted']['amount']);
    }

    public function test_swahili_cost_request_is_confident(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'Tunahitaji kulipa fundi Ksh 12,000 leo']);
        $this->assertSame('cost_request', $r['class']);
        $this->assertTrue($r['auto_file']);
        $this->assertSame(12000.0, $r['extracted']['amount']);
    }

    public function test_new_safaricom_011_numbers_are_extracted(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'Please send 20,000 to Mary 0112 345 678 for the sand']);
        $this->assertSame('cost_request', $r['class']);
        $this->assertSame('0112345678', $r['extracted']['phone']);
    }

    public function test_bank_debit_sms_ignores_available_balance(): void
    {
        $text = "Dear Customer, your account 0120******88 has been debited KES 25,000.00 on 10-09-2026. Ref: 5A7XB2KQ9M. Avail. Bal: KES 102,450.00";
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => $text]);
        $this->assertSame('payment_sms', $r['class']);
        $this->assertSame(25000.0, $r['extracted']['amount']);
        $this->assertSame('5A7XB2KQ9M', $r['extracted']['reference_number']);
        $this->assertSame('2026-09-10', $r['extracted']['date']);
    }

    public function test_quantities_are_not_amounts(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'Delivered 1,200 bags of cement and 3,000 blocks to site today']);
        $this->assertSame('chit_chat', $r['class']);
    }

    public function test_acknowledgement_text_is_chit_chat(): void
    {
        $r = $this->classifier->classify(['media_type' => 'text', 'text' => 'Received, thank you. Will confirm with the fundi.']);
        $this->assertSame('chit_chat', $r['class']);
    }
}
