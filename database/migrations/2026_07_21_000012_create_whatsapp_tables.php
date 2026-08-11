<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('whatsapp_contacts')) {
            Schema::create('whatsapp_contacts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('phone_number', 20);
                $table->string('name')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('whatsapp_logs')) {
            Schema::create('whatsapp_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('phone_number', 20);
                $table->text('message');
                $table->enum('direction', ['inbound', 'outbound']);
                $table->enum('status', ['sent', 'received', 'read', 'failed'])->default('sent');
                $table->string('message_id')->nullable();
                $table->timestamp('timestamp')->useCurrent();
            });
        }

        if (!Schema::hasTable('whatsapp_webhook_events')) {
            Schema::create('whatsapp_webhook_events', function (Blueprint $table) {
                $table->id();
                $table->json('payload');
                $table->string('signature')->nullable();
                $table->timestamp('timestamp')->useCurrent();
                $table->boolean('processed')->default(false);
                $table->text('error_message')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_webhook_events');
        Schema::dropIfExists('whatsapp_logs');
        Schema::dropIfExists('whatsapp_contacts');
    }
};
