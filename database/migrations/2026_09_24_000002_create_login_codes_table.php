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
        if (! Schema::hasTable('login_codes')) {
            Schema::create('login_codes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('code_hash');
                $table->timestamp('expires_at');
                $table->timestamp('used_at')->nullable();
                $table->string('requested_ip', 45)->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('login_codes');
    }
};
