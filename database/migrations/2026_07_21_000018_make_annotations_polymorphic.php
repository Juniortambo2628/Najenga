<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('annotations')->delete();

        Schema::table('annotations', function (Blueprint $table) {
            $table->dropIndex(['photo_id']);
            $table->dropColumn('photo_id');

            $table->unsignedBigInteger('annotatable_id');
            $table->string('annotatable_type');

            $table->index(['annotatable_type', 'annotatable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('annotations', function (Blueprint $table) {
            $table->dropIndex(['annotatable_type', 'annotatable_id']);
            $table->dropColumn(['annotatable_id', 'annotatable_type']);

            $table->unsignedBigInteger('photo_id');
            $table->index('photo_id');
        });
    }
};
