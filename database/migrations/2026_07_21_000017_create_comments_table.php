<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('comments'); // Ensure clean state
        if (!Schema::hasTable('comments')) {
            Schema::create('comments', function (Blueprint $table) {
                $table->id();
                $table->text('body');
                $table->unsignedBigInteger('user_id');
                $table->string('commentable_type', 191);
                $table->unsignedBigInteger('commentable_id');
                $table->timestamps();

                $table->index('user_id');
                $table->index(['commentable_type', 'commentable_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
