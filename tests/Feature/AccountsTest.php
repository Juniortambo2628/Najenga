<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Accounts as in the OKJT kit: a client's account holds their projects; their managers are its staff. */
class AccountsTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): object
    {
        return require database_path('migrations/2026_11_01_000001_create_accounts_for_clients_and_staff.php');
    }

    public function test_existing_clients_get_accounts_and_managers_become_their_staff(): void
    {
        $client = User::factory()->create(['first_name' => 'Wanjiru', 'last_name' => 'Kamau']);
        $other = User::factory()->create(['first_name' => 'Otieno', 'last_name' => 'Odhiambo']);
        $manager = User::factory()->create(['role' => 'manager']);
        $a = Project::factory()->create(['client_id' => $client->id, 'manager_id' => $manager->id]);
        $b = Project::factory()->create(['client_id' => $client->id]);
        $c = Project::factory()->create(['client_id' => $other->id, 'manager_id' => $manager->id]);

        // As before the migration: no accounts.
        $this->migration()->down();
        $this->migration()->up();

        $accounts = DB::table('accounts')->orderBy('id')->pluck('name', 'id');
        $this->assertSame(['Wanjiru Kamau', 'Otieno Odhiambo'], $accounts->values()->all());
        $mine = $accounts->search('Wanjiru Kamau');
        $this->assertSame([$mine, $mine], DB::table('projects')->whereIn('id', [$a->id, $b->id])->pluck('account_id')->all());

        $this->assertSame('owner', DB::table('account_user')->where('account_id', $mine)->where('user_id', $client->id)->value('role'));
        $staff = DB::table('account_user')->where('account_id', $mine)->where('user_id', $manager->id)->first();
        $this->assertSame('staff', $staff->role);
        $this->assertSame('owner', $staff->workspace_role);
        $this->assertFalse((bool) $staff->all_workspaces);
        // Staff on each client's account whose project they manage, once.
        $this->assertSame(2, DB::table('account_user')->where('user_id', $manager->id)->count());
        // Their access itself is unchanged: owner of the projects they manage only.
        $this->assertSame('owner', $a->roleFor($manager));
        $this->assertNull($b->roleFor($manager));
        $this->assertSame('owner', $c->roleFor($manager));
    }

    public function test_a_new_project_joins_its_clients_account(): void
    {
        $client = User::factory()->create();

        $first = Project::factory()->create(['client_id' => $client->id]);
        $second = Project::factory()->create(['client_id' => $client->id]);

        $this->assertNotNull($first->account_id);
        $this->assertSame($first->account_id, $second->account_id);
        $this->assertSame($client->id, Account::find($first->account_id)->members()->wherePivot('role', 'owner')->value('users.id'));
        $this->assertSame([$first->id, $second->id], $client->ownedAccount()->workspaces()->orderBy('id')->pluck('id')->all());
    }

    public function test_assigning_a_manager_makes_them_staff_and_a_new_client_moves_the_project(): void
    {
        $client = User::factory()->create();
        $manager = User::factory()->create(['role' => 'manager']);
        $project = Project::factory()->create(['client_id' => $client->id]);

        $project->update(['manager_id' => $manager->id]);
        $this->assertSame('staff', $project->account->members()->whereKey($manager->id)->first()->pivot->role);

        $newClient = User::factory()->create();
        $project->update(['client_id' => $newClient->id]);
        $this->assertSame($newClient->ownedAccount()->id, $project->fresh()->account_id);
    }
}
