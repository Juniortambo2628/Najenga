<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Accounts (the OKJT kit's, as in Naoa): each client gets an account they own,
 * holding their projects; each project's manager becomes staff on that
 * account, an owner of the projects they manage (as they already are in
 * project_user). The global role "manager" means account staff from here on.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('accounts')) {
            Schema::create('accounts', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('account_user')) {
            Schema::create('account_user', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('account_id')->index();
                $table->unsignedBigInteger('user_id')->index();
                $table->string('role', 20)->default('owner'); // owner | staff
                $table->boolean('all_workspaces')->default(false);
                $table->string('workspace_role', 20)->nullable();
                $table->timestamps();
                $table->unique(['account_id', 'user_id']);
            });
        }

        if (! Schema::hasColumn('projects', 'account_id')) {
            Schema::table('projects', fn (Blueprint $table) => $table->unsignedBigInteger('account_id')->nullable()->index());
        }

        $now = now();
        $accountOf = [];
        $clients = DB::table('projects')->whereNotNull('client_id')->distinct()->pluck('client_id');
        foreach ($clients as $clientId) {
            $client = DB::table('users')->where('id', $clientId)->first();
            if (! $client) {
                continue;
            }
            $name = trim(($client->first_name ?? '').' '.($client->last_name ?? '')) ?: $client->email;
            $accountOf[$clientId] = DB::table('accounts')->insertGetId(['name' => $name, 'created_at' => $now, 'updated_at' => $now]);
            DB::table('account_user')->insert([
                'account_id' => $accountOf[$clientId], 'user_id' => $clientId, 'role' => 'owner',
                'all_workspaces' => false, 'workspace_role' => null, 'created_at' => $now, 'updated_at' => $now,
            ]);
            DB::table('projects')->where('client_id', $clientId)->update(['account_id' => $accountOf[$clientId]]);
        }

        foreach (DB::table('projects')->whereNotNull('manager_id')->get(['client_id', 'manager_id']) as $project) {
            $account = $accountOf[$project->client_id] ?? null;
            if (! $account || (int) $project->manager_id === (int) $project->client_id
                || DB::table('account_user')->where('account_id', $account)->where('user_id', $project->manager_id)->exists()) {
                continue;
            }
            DB::table('account_user')->insert([
                'account_id' => $account, 'user_id' => $project->manager_id, 'role' => 'staff',
                'all_workspaces' => false, 'workspace_role' => 'owner', 'created_at' => $now, 'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('projects', 'account_id')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropIndex(['account_id']);
                $table->dropColumn('account_id');
            });
        }
        Schema::dropIfExists('account_user');
        Schema::dropIfExists('accounts');
    }
};
