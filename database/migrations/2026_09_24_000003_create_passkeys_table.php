<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Reproduces the production migration of the same name (it was never committed to this repo).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('passkeys')) {
            Schema::create('passkeys', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('name', 100);
                $table->binary('credential_id');
                $table->text('public_key_credential_source');
                $table->unsignedBigInteger('counter')->default(0);
                $table->timestamp('last_used_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('passkeys');
    }
};
