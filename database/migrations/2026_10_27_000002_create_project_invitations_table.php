<?php

use App\Support\ForeignKeyColumn;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 12.4: invitations by email for people who may not have an account.
 *
 * The emailed link is a signed URL carrying a random token; only its SHA-256
 * is stored. Accepting (after signing in or signing up) adds a project_user
 * row with the invited role and stamps accepted_at/accepted_by here.
 * Pending = not accepted, not revoked, not expired.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_invitations', function (Blueprint $table) {
            $table->id();
            ForeignKeyColumn::add($table, 'project_id', 'projects');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
            $table->string('email', 191);
            $table->string('role', 20)->default('viewer');
            $table->char('token_hash', 64)->unique();
            ForeignKeyColumn::add($table, 'invited_by', 'users')->nullable();
            $table->foreign('invited_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            ForeignKeyColumn::add($table, 'accepted_by', 'users')->nullable();
            $table->foreign('accepted_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'email']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_invitations');
    }
};
