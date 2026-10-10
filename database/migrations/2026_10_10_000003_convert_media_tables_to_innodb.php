<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var string[] */
    private array $tables = ['photos', 'documents', 'folders'];

    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        foreach ($this->tables as $table) {
            $engine = $this->engineOf($table);

            if ($engine !== null && strcasecmp($engine, 'MyISAM') === 0) {
                DB::statement("ALTER TABLE `{$table}` ENGINE=InnoDB");
            }
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        foreach ($this->tables as $table) {
            $engine = $this->engineOf($table);

            if ($engine !== null && strcasecmp($engine, 'InnoDB') === 0 && ! $this->hasForeignKey($table)) {
                DB::statement("ALTER TABLE `{$table}` ENGINE=MyISAM");
            }
        }
    }

    private function engineOf(string $table): ?string
    {
        $row = DB::selectOne(
            "SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
            [$table]
        );

        return $row->ENGINE ?? null;
    }

    private function hasForeignKey(string $table): bool
    {
        $row = DB::selectOne(
            "SELECT COUNT(*) AS c FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ?",
            [$table]
        );

        return (int) $row->c > 0;
    }
};
