<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const PAIRS = [
        ['activity_logs', 'user_id', 'users', 'id'],
        ['annotations', 'user_id', 'users', 'id'],
        ['comments', 'parent_id', 'comments', 'id'],
        ['comments', 'user_id', 'users', 'id'],
        ['conversation_user', 'conversation_id', 'conversations', 'id'],
        ['conversation_user', 'user_id', 'users', 'id'],
        ['documents', 'folder_id', 'folders', 'id'],
        ['documents', 'project_id', 'projects', 'id'],
        ['documents', 'user_id', 'users', 'id'],
        ['expenses', 'project_id', 'projects', 'id'],
        ['expenses', 'user_id', 'users', 'id'],
        ['folders', 'parent_id', 'folders', 'id'],
        ['folders', 'project_id', 'projects', 'id'],
        ['messages', 'conversation_id', 'conversations', 'id'],
        ['messages', 'user_id', 'users', 'id'],
        ['photos', 'project_id', 'projects', 'id'],
        ['photos', 'user_id', 'users', 'id'],
        ['project_timelines', 'project_id', 'projects', 'id'],
        ['project_user', 'user_id', 'users', 'id'],
        ['projects', 'client_id', 'users', 'id'],
        ['projects', 'manager_id', 'users', 'id'],
        ['receipts', 'expense_id', 'expenses', 'id'],
        ['whatsapp_contacts', 'user_id', 'users', 'id'],
        ['whatsapp_logs', 'user_id', 'users', 'id'],
    ];

    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        foreach (self::PAIRS as [$table, $column, $refTable, $refColumn]) {
            $ref = DB::selectOne(
                'SELECT COLUMN_TYPE, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
                [$refTable, $refColumn]
            );

            $col = DB::selectOne(
                'SELECT COLUMN_TYPE, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
                [$table, $column]
            );

            if ($ref === null || $col === null || $ref->COLUMN_TYPE === $col->COLUMN_TYPE) {
                continue;
            }

            $nullability = $col->IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';

            DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` {$ref->COLUMN_TYPE} {$nullability}");
        }
    }

    public function down(): void
    {
    }
};
