<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->unsignedBigInteger('project_id')->nullable()->change();
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            $indexes = DB::select(
                "SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expenses' AND COLUMN_NAME = 'project_id' AND INDEX_NAME != 'PRIMARY'"
            );
            foreach ($indexes as $index) {
                DB::statement("ALTER TABLE `expenses` DROP INDEX `{$index->INDEX_NAME}`");
            }
        } else {
            Schema::table('expenses', function (Blueprint $table) {
                $table->dropIndex(['project_id']);
            });
        }

        $hasNulls = DB::table('expenses')->whereNull('project_id')->exists();

        Schema::table('expenses', function (Blueprint $table) use ($hasNulls) {
            if (! $hasNulls) {
                $table->unsignedBigInteger('project_id')->nullable(false)->change();
            }
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });
    }
};
