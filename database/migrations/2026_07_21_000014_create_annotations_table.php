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
        if (!Schema::hasTable('annotations')) {
            Schema::create('annotations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('photo_id');
                $table->unsignedBigInteger('user_id');
                $table->decimal('x', 5, 2);
                $table->decimal('y', 5, 2);
                $table->text('body');
                $table->boolean('resolved')->default(false);
                $table->timestamps();

                $table->index('photo_id');
                $table->index('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annotations');
    }
};
