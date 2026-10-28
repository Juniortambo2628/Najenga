<?php

namespace App\Support;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\ColumnDefinition;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Foreign key columns for migrations, typed like the column they reference.
 *
 * Production's keys aren't all BIGINT UNSIGNED (some tables predate Laravel's
 * defaults; see 2026_10_10_001000_align_fk_column_types), and MySQL refuses a
 * foreign key whose column type differs from the referenced one. foreignId()
 * always makes BIGINT UNSIGNED, so new migrations use this instead.
 */
final class ForeignKeyColumn
{
    /** Add `$column` with the integer type of `$refTable.$refColumn`. */
    public static function add(Blueprint $table, string $column, string $refTable, string $refColumn = 'id'): ColumnDefinition
    {
        [$method, $unsigned] = self::typeOf($refTable, $refColumn);

        return $table->{$method}($column, false, $unsigned);
    }

    /** Whether `$table.$column` already has a foreign key. */
    public static function exists(string $table, string $column): bool
    {
        return collect(Schema::getForeignKeys($table))->contains(fn (array $fk) => $fk['columns'] === [$column]);
    }

    /**
     * On MySQL, change an existing `$table.$column` to the referenced
     * column's type (keeping its nullability) when the two differ.
     */
    public static function align(string $table, string $column, string $refTable, string $refColumn = 'id'): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $ref = self::column($refTable, $refColumn);
        $col = self::column($table, $column);
        if ($ref && $col && $ref->COLUMN_TYPE !== $col->COLUMN_TYPE) {
            $nullability = $col->IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
            DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` {$ref->COLUMN_TYPE} {$nullability}");
        }
    }

    /** @return array{0: string, 1: bool} the Blueprint method and whether it is unsigned */
    private static function typeOf(string $table, string $column): array
    {
        if (DB::getDriverName() !== 'mysql' || ! ($info = self::column($table, $column))) {
            return ['bigInteger', true];
        }

        $type = strtolower($info->COLUMN_TYPE);
        $method = match (true) {
            str_starts_with($type, 'bigint') => 'bigInteger',
            str_starts_with($type, 'mediumint') => 'mediumInteger',
            str_starts_with($type, 'smallint') => 'smallInteger',
            str_starts_with($type, 'tinyint') => 'tinyInteger',
            default => 'integer',
        };

        return [$method, str_contains($type, 'unsigned')];
    }

    private static function column(string $table, string $column): ?object
    {
        return DB::selectOne(
            'SELECT COLUMN_TYPE, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$table, $column]
        );
    }
}
