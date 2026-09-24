<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Production's users.id was scaffolded as INT UNSIGNED (older Laravel),
        // so foreignId('user_id')->constrained() (BIGINT UNSIGNED) is refused
        // with SQLSTATE HY000 3780 "incompatible foreign key" on first create.
        // Drop the FK constraint and keep only the index — cascade delete is
        // enforced at the application layer via the User->passkeys relation.
        if (Schema::hasTable('passkeys')) {
            return;
        }

        Schema::create('passkeys', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('name', 100);
            $table->binary('credential_id');
            $table->text('public_key_credential_source');
            $table->unsignedBigInteger('counter')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('passkeys');
    }
};
