<?php

namespace Tests\Unit;

use App\Services\Receipts\ExpenseCategory;
use App\Services\Receipts\ReceiptReader;
use PHPUnit\Framework\TestCase;

/**
 * What ReceiptReader makes of what OCR (or a PDF) gives it. The texts are
 * made up, shaped like the real thing: OCR's stray characters included.
 */
class ReceiptReaderTest extends TestCase
{
    /** A WhatsApp chat screenshot: payments, the labels around them, chat. */
    private const CHAT = <<<'TXT'
14:30 oll > EE
Sunday
Good morning, heading to site.
12:07
Have reached. 13:27
» Forwarded
Es invoice-INV-00123. pdf
1 page - 412 KB - pdf
13:39
QA1B23CDEF Confirmed.
~ Ksh18,400.00 sent to Equity
Paybill Account for account
445566 on 1/11/26 at 1:38 PM
7” 13:41
‘al For Sand and Ballast
13:41
Transport Truck 13:46
QB2C34DEFG Confirmed.
~ Ksh40,000.00 sent to PETER
~ OTIENO 0712345678 on 29/10/26 at
. 6:57 PM. vas
“+ QC3D45EFGH Confirmed.
Ksh25,000.00 sent to PETER
OTIENO 0712345678 on 30/10/26 at
6:19 PM.
13:48
Fuel 13:49
QD4E56FGHJ Confirmed.
Ksh5,500.00 paid to RUBIS
ENERGY - MOMBASA ROAD.
~ 0n 30/10/26 at 8:08 AM.
. Accommodation 13:49 |
~ QE5F67GHJK Confirmed.
Ksh3,200.00 sent to MARY
WANJIKU 0722111222 on
Ba 1/11/26 at 12:05 PM.
, Transport site 13:50
QF6G78HJKL Confirmed.
Ksh2,000.00 sent to ALI
HASSAN 0733444555 on
| 111/26 at 1:30PM.
~ QG7H89JKLM Confirmed.
Ksh1,500.00 sent to ALI
HASSAN 0733444555 on
1/11/26 at 1:30 PM.
13:51
We have arrived.
TXT;

    /** The same screenshot read another way: other characters wrong. */
    private const CHAT_OTHER_READING = <<<'TXT'
QA1IB23CDEF Confirmed.
Ksh18,400.00 sent to Equity Paybill Account for account 445566 on 1/11/26 at 1:38 PM
QB2C34DEFG Confirmed.
Ksh40,000.00 sent to PETER OTIENO 0712345678 on 29/10/26 at 6:57 PM.
QC3D45EFGH Confirmed.
Ksh25,000.00 sent to PETER OTIENO 0712345678 on 30/10/26 at 6:19 PM.
QD4E56FGHJ Confirmed.
Ksh5,500.00 paid to RUBIS ENERGY - MOMBASA ROAD. on 30/10/26 at 8:08 AM.
QE5F67GHJK Confirmed.
Ksh3,200.00 sent toMARY WANJIKU 0722111222 on » 11/26 at 12:05 PM.
QF6G78HJKL Confirmed.
Ksh2,000.00 sent to ALI HASSAN 0733444555 on ae at1:30PM.
QG7H89JKLM Confirmed.
Ksh1,500.00 sent to ALI HASSAN 0733444555 on 1/11/26 at 1:30 PM.
TXT;

    private function reader(): ReceiptReader
    {
        return new ReceiptReader();
    }

    public function test_a_chat_screenshot_gives_one_expense_per_payment_with_what_it_was_for(): void
    {
        $result = $this->reader()->read(self::CHAT, [self::CHAT_OTHER_READING]);

        $this->assertSame('payments', $result['kind']);
        $this->assertNull($result['document'], 'the attached invoice\'s file name does not make it an invoice');
        $this->assertSame(
            ['QA1B23CDEF', 'QB2C34DEFG', 'QC3D45EFGH', 'QD4E56FGHJ', 'QE5F67GHJK', 'QF6G78HJKL', 'QG7H89JKLM'],
            array_column($result['expenses'], 'reference_number'),
        );
        $this->assertSame([18400.0, 40000.0, 25000.0, 5500.0, 3200.0, 2000.0, 1500.0], array_column($result['expenses'], 'amount'));

        // "For Sand and Ballast" after a payment is that payment's; a label applies until the next one.
        $this->assertSame(
            ['Sand and Ballast', 'Transport Truck', 'Transport Truck', 'Fuel', 'Accommodation', 'Transport site', 'Transport site'],
            array_column($result['expenses'], 'purpose'),
        );
        $this->assertSame(['Materials', 'Transport', 'Transport', 'Transport', 'General', 'Transport', 'Transport'], array_column($result['expenses'], 'category'));

        $first = $result['expenses'][0];
        $this->assertSame('Equity Paybill Account', $first['recipient']);
        $this->assertSame('445566', $first['account']);
        $this->assertSame('2026-11-01', $first['date']);
        $this->assertSame('1:38 PM', $first['time']);
        $this->assertSame('mobile_money', $first['payment_method']);

        $second = $result['expenses'][1];
        $this->assertSame('Peter Otieno', $second['recipient'], 'name tidied, phone number and stray marks taken off');
        $this->assertSame('0712345678', $second['phone']);
        $this->assertSame('6:57 PM', $second['time']);
        $this->assertSame('Rubis Energy - Mombasa Road', $result['expenses'][3]['recipient']);
        $this->assertSame('2026-10-30', $result['expenses'][3]['date'], '"0n" read as "on"');
        $this->assertSame('2026-11-01', $result['expenses'][4]['date'], 'a stray mark before the date');
    }

    public function test_each_field_comes_from_the_reading_where_it_is_valid(): void
    {
        $alone = $this->reader()->read(self::CHAT_OTHER_READING);
        $this->assertSame('QA1IB23CDEF', $alone['expenses'][0]['reference_number']);
        $this->assertTrue($alone['expenses'][0]['needs_check'], 'an 11-character code needs a look');

        $merged = $this->reader()->read(self::CHAT_OTHER_READING, [self::CHAT]);
        $this->assertSame('QA1B23CDEF', $merged['expenses'][0]['reference_number']);
        $this->assertFalse($merged['expenses'][0]['needs_check']);
    }

    public function test_a_date_ocr_lost_is_borrowed_from_a_payment_made_the_same_minute_and_flagged(): void
    {
        $result = $this->reader()->read(self::CHAT, [self::CHAT_OTHER_READING]);
        $lost = $result['expenses'][5];

        $this->assertSame('2026-11-01', $lost['date']);
        $this->assertTrue($lost['needs_check']);
        $this->assertFalse($result['expenses'][6]['needs_check']);
    }

    public function test_chat_sentences_and_ocr_fragments_are_not_labels(): void
    {
        $result = $this->reader()->read(<<<'TXT'
Have reached. 13:27
QA1B23CDEF Confirmed. Ksh1,000.00 sent to JANE DOE 0711000111 on 2/11/26 at 9:15 AM. vas
We have arrived.
QB2C34DEFG Confirmed. Ksh2,000.00 sent to JANE DOE 0711000111 on 2/11/26 at 9:20 AM.
TXT);

        $this->assertSame([null, null], array_column($result['expenses'], 'purpose'));
        $this->assertSame(['Jane Doe', 'Jane Doe'], array_column($result['expenses'], 'title'));
    }

    public function test_one_forwarded_mpesa_sms(): void
    {
        $result = $this->reader()->read('QA1B23CDEF Confirmed. Ksh4,350.00 paid to KAMAU HARDWARE. on 5/11/26 at 10:02 AM. New M-PESA balance is Ksh12,000.00. Transaction cost, Ksh0.00.');

        $this->assertSame('payments', $result['kind']);
        $this->assertCount(1, $result['expenses']);
        $this->assertSame(4350.0, $result['expenses'][0]['amount'], 'not the balance');
        $this->assertSame('Kamau Hardware', $result['expenses'][0]['recipient']);
        $this->assertSame('Materials', $result['expenses'][0]['category']);
        $this->assertSame('2026-11-05', $result['expenses'][0]['date']);
    }

    public function test_money_received_is_not_an_expense(): void
    {
        $result = $this->reader()->read('QA1B23CDEF Confirmed. You have received Ksh10,000.00 from JANE DOE 0711000111 on 2/11/26 at 9:15 AM.');

        $this->assertNotSame('payments', $result['kind']);
    }

    /** pdftotext -layout of an airline booking confirmation. */
    private const FLIGHT = <<<'TXT'
10/20/26, 6:07 PM                                       Jambojet.com - Itinerary
                                     Your trip to Mombasa is confirmed!
       Purchase confirmation
       Thank you for travelling with Jambojet
        Booking Reference / PNR K7Q2ZX
               Nairobi (JKIA) to Mombasa                          Mombasa to Nairobi (JKIA)
             Monday 23, November 2026                              Thursday 26, November 2026
             NBO                1h            MBA                   MBA            1h           NBO
                            Flight : JM8402                                     Flight : JM8411
          Summary
           Outbound: NBO - MBA                KES 9,800           Return: MBA - NBO          KES 8,400
           1 x Fare                           KES   9,800         1 x Fare                   KES   8,400
                                                                                  Total Paid: KES 18,200
              Payment Type                     Visa
              Payment Date                Tuesday20 October 2026
              Pricing Currency                KES 18,200
TXT;

    public function test_a_flight_booking_is_one_expense_for_what_was_paid(): void
    {
        $result = $this->reader()->read(self::FLIGHT);

        $this->assertSame('flight', $result['kind']);
        $this->assertCount(1, $result['expenses']);
        $ticket = $result['expenses'][0];
        $this->assertSame('Jambojet NBO ⇄ MBA', $ticket['title']);
        $this->assertSame(18200.0, $ticket['amount']);
        $this->assertSame('2026-10-20', $ticket['date'], 'paid on the payment date, not the travel date');
        $this->assertSame('K7Q2ZX', $ticket['reference_number']);
        $this->assertSame('card', $ticket['payment_method']);
        $this->assertSame('Transport', $ticket['category']);
        $this->assertSame('Jambojet', $ticket['recipient']);
        $this->assertSame('Flights NBO ⇄ MBA, 23 Nov – 26 Nov 2026 (JM8402, JM8411)', $ticket['purpose']);
    }

    public function test_a_flight_booking_read_without_its_layout_still_reads(): void
    {
        // smalot/pdfparser (no poppler on the server): words run together, figures apart from labels.
        $result = $this->reader()->read(<<<'TXT'
Thank you for travelling with Jambojet
Booking Reference / PNRK7Q2ZX
Outbound:NBO - MBA
Return:MBA - NBO
Total Paid:
Monday23,November2026
Flight :JM8402
Thursday26,November2026
Flight :JM8411
KES9,800
KES8,400
KES18,200
Payment Type	Visa
Payment Date Tuesday20October2026
TXT);

        $ticket = $result['expenses'][0];
        $this->assertSame('flight', $result['kind']);
        $this->assertSame(18200.0, $ticket['amount']);
        $this->assertSame('K7Q2ZX', $ticket['reference_number']);
        $this->assertSame('2026-10-20', $ticket['date']);
    }

    private const INVOICE = <<<'TXT'
Mwangi Building Supplies Ltd                         Mwangi Building Supplies Ltd
Tax invoice
Invoice no: INV-00123
Bill to: JANE DOE · 0711000111
Date: Oct 29, 2026 · Due: Nov 12, 2026 · Terms: 14 days
Balance due: KES 18,400.00
 DESCRIPTION                       QTY        UNIT         TAX          TOTAL
 tile adhesive 20kg · Pieces       4.000      2,350.00     0.00         9,400.00
 cement 50kg bag · Pieces          10.000     900.00       0.00         9,000.00
Grand total: KES 18,400.00
Paid: KES 0.00
TXT;

    public function test_an_unpaid_invoice_is_a_document_not_an_expense(): void
    {
        $result = $this->reader()->read(self::INVOICE);

        $this->assertSame('invoice', $result['kind']);
        $this->assertSame([], $result['expenses']);
        $doc = $result['document'];
        $this->assertSame('invoice', $doc['type']);
        $this->assertSame('INV-00123', $doc['number']);
        $this->assertSame('Mwangi Building Supplies Ltd', $doc['issuer']);
        $this->assertSame('2026-10-29', $doc['date']);
        $this->assertSame('2026-11-12', $doc['due_date']);
        $this->assertSame(18400.0, $doc['total']);
        $this->assertSame(0.0, $doc['paid']);
        $this->assertSame(['tile adhesive 20kg', 'cement 50kg bag'], array_column($doc['items'], 'description'));
        $this->assertStringContainsString('not an expense', $result['summary']);
    }

    public function test_a_quotation_is_a_document_told_apart_from_an_invoice(): void
    {
        $result = $this->reader()->read(<<<'TXT'
Otieno Contractors Ltd
QUOTATION
Quote No: QT-2026-045
Customer: Jane Doe
Date: 03/11/2026
Valid until: 03/12/2026
Description                  Qty     Rate        Amount
Roofing labour               1       85,000.00   85,000.00
Total KES 85,000.00
TXT);

        $this->assertSame('quote', $result['kind']);
        $this->assertSame([], $result['expenses']);
        $this->assertSame('quote', $result['document']['type']);
        $this->assertSame('QT-2026-045', $result['document']['number']);
        $this->assertSame('2026-11-03', $result['document']['date']);
        $this->assertSame('2026-12-03', $result['document']['valid_until']);
        $this->assertSame(85000.0, $result['document']['total']);
    }

    public function test_a_pro_forma_invoice_is_a_quotation(): void
    {
        $result = $this->reader()->read("Proforma Invoice\nProforma No: PF-88\nTotal: KES 12,000.00");

        $this->assertSame('quote', $result['kind']);
    }

    public function test_an_invoice_marked_paid_in_full_is_a_receipt(): void
    {
        $paid = str_replace(['Balance due: KES 18,400.00', 'Paid: KES 0.00'], ['Balance due: KES 0.00', 'Paid: KES 18,400.00'], self::INVOICE);
        $result = $this->reader()->read($paid);

        $this->assertSame('receipt', $result['kind']);
        $this->assertNull($result['document']);
        $this->assertSame(18400.0, $result['expenses'][0]['amount']);
        $this->assertSame('Mwangi Building Supplies Ltd', $result['expenses'][0]['title']);
        $this->assertSame('INV-00123', $result['expenses'][0]['reference_number']);
        $this->assertSame('Materials', $result['expenses'][0]['category']);
    }

    public function test_a_till_receipt_is_one_expense_even_with_its_cu_invoice_number(): void
    {
        $result = $this->reader()->read(<<<'TXT'
KAMAU HARDWARE LIMITED
P.O BOX 123 NAIROBI
CASH SALE
Cement 50kg x 5        4,500.00
TOTAL                  4,500.00
CASH                   5,000.00
CHANGE                   500.00
CU INVOICE NO 0040012345
05/11/2026 10:02
TXT);

        $this->assertSame('receipt', $result['kind']);
        $this->assertSame(4500.0, $result['expenses'][0]['amount']);
        $this->assertSame('KAMAU HARDWARE LIMITED', $result['expenses'][0]['title']);
        $this->assertSame('2026-11-05', $result['expenses'][0]['date']);
        $this->assertSame('Materials', $result['expenses'][0]['category']);
    }

    public function test_nothing_readable_is_unknown(): void
    {
        $this->assertSame('unknown', $this->reader()->read('')['kind']);
        $this->assertSame('unknown', $this->reader()->read('Foundation slab poured today')['kind']);
    }

    public function test_categories_come_from_what_the_payment_was_for(): void
    {
        $this->assertSame('Transport', ExpenseCategory::guess('Fuel'));
        $this->assertSame('Labor', ExpenseCategory::guess('Pay fundis for the week'));
        $this->assertSame('Utilities', ExpenseCategory::guess('KPLC tokens'));
        $this->assertSame('Permits', ExpenseCategory::guess('NEMA approval'));
        $this->assertSame('Equipment', ExpenseCategory::guess('Mixer hire'));
        $this->assertSame('General', ExpenseCategory::guess('Accommodation'));
        $this->assertSame('Materials', ExpenseCategory::guess('Something else'));
    }
}
