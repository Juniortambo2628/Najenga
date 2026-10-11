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
            "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND COLUMN_NAME = 'expense_id' AND REFERENCED_TABLE_NAME = 'expenses'"
        );

        if ((int) $exists->c > 0) {
            return;
        }

        DB::statement('ALTER TABLE `receipts` ADD CONSTRAINT `receipts_expense_id_foreign` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $exists = DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND COLUMN_NAME = 'expense_id' AND REFERENCED_TABLE_NAME = 'expenses'"
        );

        if ((int) $exists->c === 0) {
            return;
        }

        DB::statement('ALTER TABLE `receipts` DROP FOREIGN KEY `receipts_expense_id_foreign`');
    }
};