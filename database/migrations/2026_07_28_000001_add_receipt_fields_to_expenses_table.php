<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('time', 20)->nullable()->after('expense_date');
            $table->string('recipient')->nullable()->after('payment_method');
            $table->string('reference_number', 100)->nullable()->after('recipient');
            $table->string('purpose')->nullable()->after('reference_number');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['time', 'recipient', 'reference_number', 'purpose']);
        });
    }
};
