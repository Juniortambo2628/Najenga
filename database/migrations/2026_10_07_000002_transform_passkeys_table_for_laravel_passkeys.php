<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use ParagonIE\ConstantTime\Base64UrlSafe;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE passkeys ENGINE=InnoDB");
        }

        Schema::table('passkeys', function (Blueprint $table) {
            $table->json('credential')->nullable();
        });

        foreach (DB::table('passkeys')->orderBy('id')->get() as $row) {
            $source = json_decode($row->public_key_credential_source, true, flags: JSON_THROW_ON_ERROR);

            DB::table('passkeys')->where('id', $row->id)->update([
                'credential' => $row->public_key_credential_source,
                'credential_id' => $source['publicKeyCredentialId'] ?? Base64UrlSafe::encodeUnpadded($row->credential_id),
            ]);
        }

        Schema::table('passkeys', function (Blueprint $table) {
            $table->string('credential_id', 255)->unique()->change();
            $table->string('name', 255)->change();
        });

        Schema::table('passkeys', function (Blueprint $table) {
            $table->json('credential')->nullable(false)->change();
        });

        Schema::table('passkeys', function (Blueprint $table) {
            $table->dropColumn(['public_key_credential_source', 'counter']);
        });

        Schema::table('passkeys', function (Blueprint $table) {
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('passkeys', function (Blueprint $table) {
            $table->text('public_key_credential_source')->nullable();
            $table->unsignedBigInteger('counter')->default(0);
        });

        Schema::table('passkeys', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropUnique(['credential_id']);
        });

        Schema::table('passkeys', function (Blueprint $table) {
            $table->binary('credential_id')->change();
            $table->string('name', 100)->change();
        });

        foreach (DB::table('passkeys')->orderBy('id')->get() as $row) {
            $source = json_decode($row->credential, true, flags: JSON_THROW_ON_ERROR);

            DB::table('passkeys')->where('id', $row->id)->update([
                'public_key_credential_source' => $row->credential,
                'counter' => $source['counter'] ?? 0,
                'credential_id' => Base64UrlSafe::decode($row->credential_id),
            ]);
        }

        Schema::table('passkeys', function (Blueprint $table) {
            $table->dropColumn('credential');
        });
    }
};
