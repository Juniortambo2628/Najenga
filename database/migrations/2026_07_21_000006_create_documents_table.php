<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('filename');
            $table->string('original_name');
            $table->string('file_path', 500);
            $table->integer('file_size');
            $table->string('mime_type', 100);
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('category', ['drawing', 'permit', 'invoice', 'ticket', 'other'])->default('other');
            $table->date('document_date')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('category');
            $table->index('document_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
