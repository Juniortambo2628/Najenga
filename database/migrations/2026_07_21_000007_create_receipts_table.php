<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_id')->constrained('expenses')->onDelete('cascade');
            $table->string('filename');
            $table->string('original_name');
            $table->string('file_path', 500);
            $table->integer('file_size');
            $table->string('mime_type', 100);
            $table->json('ocr_data')->nullable();
            $table->decimal('ocr_confidence', 5, 2)->nullable();
            $table->text('extracted_text')->nullable();
            $table->decimal('extracted_amount', 15, 2)->nullable();
            $table->date('extracted_date')->nullable();
            $table->string('extracted_merchant', 255)->nullable();
            $table->string('extracted_receipt_id', 100)->nullable();
            $table->string('ocr_language', 10)->nullable();
            $table->string('ocr_provider', 50)->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->decimal('amount_confidence', 5, 2)->nullable();
            $table->decimal('date_confidence', 5, 2)->nullable();
            $table->decimal('merchant_confidence', 5, 2)->nullable();
            $table->decimal('receipt_id_confidence', 5, 2)->nullable();
            $table->boolean('needs_verification')->default(false);
            $table->enum('verification_status', ['pending', 'verified', 'rejected', 'auto_verified'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
