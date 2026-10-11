<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $exists = DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folders' AND COLUMN_NAME = 'parent_id' AND REFERENCED_TABLE_NAME = 'folders'"
        );

        if ((int) $exists->c > 0) {
            return;
        }

        DB::statement('ALTER TABLE `folders` ADD CONSTRAINT `folders_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `folders` (`id`) ON DELETE CASCADE');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $exists = DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folders' AND COLUMN_NAME = 'parent_id' AND REFERENCED_TABLE_NAME = 'folders'"
        );

        if ((int) $exists->c === 0) {
            return;
        }

        DB::statement('ALTER TABLE `folders` DROP FOREIGN KEY `folders_parent_id_foreign`');
    }
};