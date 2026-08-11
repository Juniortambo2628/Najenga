<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('document_annotations');
        Schema::dropIfExists('document_comments');
        Schema::dropIfExists('photo_annotations');
        Schema::dropIfExists('photo_comments');
        Schema::dropIfExists('project_shares');
        Schema::dropIfExists('email_logs');
        Schema::dropIfExists('user_sessions');
    }

    public function down(): void
    {
        // These tables are from the legacy schema and cannot be recreated
        // This migration is intentionally non-reversible for orphaned tables
    }
};
