<?php

namespace Tests\Unit;

use App\Services\ReceiptParser;
use Tests\TestCase;

class ReceiptParserTest extends TestCase
{
    private ReceiptParser $parser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new ReceiptParser();
    }

    public function test_mpesa_paid_to_receipt(): void
    {
        $text = 'Today 15:41 KES 90,000.00 paid to KISUMU CONCRETE PRODUCTS PLC (Acc 837601) on 16/07/26 at 03:41 PM Ref: UGGSG3I38V. Enquiries, call 0719088000';
        $data = $this->parser->parse($text);

        $this->assertEquals('KISUMU CONCRETE PRODUCTS PLC', $data['recipient']);
        $this->assertEquals(90000.0, $data['total']);
        $this->assertEquals('2026-07-16', $data['date']);
        $this->assertEquals('03:41 PM', $data['time']);
        $this->assertEquals('UGGSG3I38V', $data['reference_number']);
        $this->assertEquals('mobile_money', $data['payment_method']);
        $this->assertNull($data['purpose']);
    }

    public function test_sent_to_receipt(): void
    {
        $text = 'Ksh 218,400.00 sent to JOHN DOE for account 123456 has been confirmed';
        $data = $this->parser->parse($text);

        $this->assertEquals('JOHN DOE', $data['recipient']);
        $this->assertEquals(218400.0, $data['total']);
    }

    public function test_two_digit_year(): void
    {
        $text = 'KES 5,000.00 paid to SAFEWAY LIMITED on 25/12/24 at 10:30 AM Ref: ABC123456';
        $data = $this->parser->parse($text);

        $this->assertEquals('2024-12-25', $data['date']);
        $this->assertEquals('SAFEWAY LIMITED', $data['recipient']);
    }

    public function test_purpose_stays_empty(): void
    {
        $text = 'KES 10,000.00 paid to VENDOR X on 01/01/26 Ref: REF123456';
        $data = $this->parser->parse($text);

        $this->assertNull($data['purpose']);
    }

    public function test_four_digit_year(): void
    {
        $text = 'KES 5,000.00 paid to VENDOR on 25/12/2024 at 10:30 AM';
        $data = $this->parser->parse($text);

        $this->assertEquals('2024-12-25', $data['date']);
    }

    public function test_bank_transfer_receipt(): void
    {
        $text = 'Bank Transfer KES 150,000.00 sent to ABC COMPANY LTD Ref: BT20260801001';
        $data = $this->parser->parse($text);

        $this->assertEquals('ABC COMPANY LTD', $data['recipient']);
        $this->assertEquals(150000.0, $data['total']);
        $this->assertEquals('bank_transfer', $data['payment_method']);
        $this->assertEquals('BT20260801001', $data['reference_number']);
    }

    public function test_empty_text_returns_nulls(): void
    {
        $data = $this->parser->parse('');

        $this->assertNull($data['total']);
        $this->assertNull($data['recipient']);
        $this->assertNull($data['date']);
        $this->assertNull($data['reference_number']);
    }

    public function test_usd_currency(): void
    {
        $text = 'USD 500.00 paid to AMAZON INC on 01/06/26 Ref: USD123456';
        $data = $this->parser->parse($text);

        $this->assertEquals(500.0, $data['total']);
    }

    public function test_cash_payment_method(): void
    {
        $text = 'KES 5,000.00 cash paid to VENDOR on 01/01/26';
        $data = $this->parser->parse($text);

        $this->assertEquals('cash', $data['payment_method']);
    }

    public function test_card_payment_method(): void
    {
        $text = 'KES 10,000.00 paid to STORE via Visa card on 01/01/26 Ref: CARD123456';
        $data = $this->parser->parse($text);

        $this->assertEquals('card', $data['payment_method']);
    }
}
