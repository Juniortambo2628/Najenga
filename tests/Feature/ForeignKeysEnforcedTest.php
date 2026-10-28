<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * The test database enforces foreign keys, as production's MySQL does, so a
 * row pointing at nothing fails here and not first on a deploy.
 */
class ForeignKeysEnforcedTest extends TestCase
{
    use RefreshDatabase;

    public function test_foreign_keys_are_enforced(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            $this->assertSame(1, (int) DB::selectOne('PRAGMA foreign_keys')->foreign_keys);
        }

        $user = User::factory()->create();

        $this->expectException(QueryException::class);
        Expense::factory()->create(['user_id' => $user->id, 'project_id' => 999999]);
    }
}
