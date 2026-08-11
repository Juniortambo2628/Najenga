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

                $table->foreign('photo_id')->references('id')->on('photos')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
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
