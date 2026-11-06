<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Quotations get a category of their own, apart from invoices (Receipt
 * Verification files both as documents).
 *
 * The column becomes plain text: an enum would need this migration again
 * for every new category, and the app already checks the value
 * (UpdateDocumentRequest). Existing values are kept as they are.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('category', 50)->default('other')->change();
        });
    }

    public function down(): void
    {
        // Left as text: going back to the enum would refuse any row filed
        // as a quotation since.
    }
};
