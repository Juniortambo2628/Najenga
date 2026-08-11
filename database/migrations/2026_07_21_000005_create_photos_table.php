<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('photos')) {
            Schema::create('photos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('filename');
                $table->string('original_name');
                $table->string('file_path', 500);
                $table->integer('file_size');
                $table->string('mime_type', 100);
                $table->string('title')->nullable();
                $table->string('location', 255)->nullable();
                $table->text('description')->nullable();
                $table->string('category', 50)->nullable();
                $table->date('photo_date')->nullable();
                $table->boolean('is_featured')->default(false);
                $table->timestamps();

                $table->index('user_id');
                $table->index('photo_date');
                $table->index('is_featured');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
