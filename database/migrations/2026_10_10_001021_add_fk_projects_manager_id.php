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
            "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'manager_id' AND REFERENCED_TABLE_NAME = 'users'"
        );

        if ((int) $exists->c > 0) {
            return;
        }

        DB::statement('ALTER TABLE `projects` ADD CONSTRAINT `projects_manager_id_foreign` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $exists = DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'manager_id' AND REFERENCED_TABLE_NAME = 'users'"
        );

        if ((int) $exists->c === 0) {
            return;
        }

        DB::statement('ALTER TABLE `projects` DROP FOREIGN KEY `projects_manager_id_foreign`');
    }
};