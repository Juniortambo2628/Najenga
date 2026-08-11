<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            return;
        }

        $columns = ['email_verified_at', 'remember_token'];
        $missing = array_filter($columns, fn($col) => !Schema::hasColumn('users', $col));

        if (!empty($missing)) {
            Schema::table('users', function (Blueprint $table) use ($missing) {
                if (in_array('email_verified_at', $missing)) {
                    $table->timestamp('email_verified_at')->nullable()->after('email');
                }
                if (in_array('remember_token', $missing)) {
                    $table->rememberToken()->after('password');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'email_verified_at')) {
                    $table->dropColumn('email_verified_at');
                }
                if (Schema::hasColumn('users', 'remember_token')) {
                    $table->dropRememberToken();
                }
            });
        }
    }
};
