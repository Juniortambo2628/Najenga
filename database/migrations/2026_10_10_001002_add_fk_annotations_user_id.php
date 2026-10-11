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
            "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'annotations' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users'"
        );

        if ((int) $exists->c > 0) {
            return;
        }

        DB::statement('ALTER TABLE `annotations` ADD CONSTRAINT `annotations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $exists = DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'annotations' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users'"
        );

        if ((int) $exists->c === 0) {
            return;
        }

        DB::statement('ALTER TABLE `annotations` DROP FOREIGN KEY `annotations_user_id_foreign`');
    }
};