<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('projects')) {
            Schema::create('projects', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100);
                $table->text('description')->nullable();
                $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
                $table->enum('status', ['planning', 'active', 'on_hold', 'completed', 'cancelled'])->default('planning');
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->decimal('budget', 15, 2)->nullable();
                $table->string('location', 255)->nullable();
                $table->integer('progress')->default(0);
                $table->timestamps();

                $table->index('client_id');
                $table->index('status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
