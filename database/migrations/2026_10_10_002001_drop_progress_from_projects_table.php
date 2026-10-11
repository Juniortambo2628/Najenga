<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'progress')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('progress');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('projects') && ! Schema::hasColumn('projects', 'progress')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->integer('progress')->default(0);
            });
        }
    }
};
