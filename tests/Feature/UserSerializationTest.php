<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserSerializationTest extends TestCase
{
    use RefreshDatabase;

    public function test_two_factor_secrets_are_hidden_from_serialization(): void
    {
        $user = User::factory()->create();
        $user->forceFill([
            'two_factor_secret' => 'SECRETVALUE',
            'two_factor_recovery_codes' => json_encode(['code-one', 'code-two']),
        ])->save();

        $fresh = $user->fresh();

        $this->assertArrayNotHasKey('two_factor_secret', $fresh->toArray());
        $this->assertArrayNotHasKey('two_factor_recovery_codes', $fresh->toArray());
    }

    public function test_two_factor_secrets_are_not_in_inertia_auth_props(): void
    {
        $user = User::factory()->create();
        $user->forceFill([
            'two_factor_secret' => 'SECRETVALUE',
            'two_factor_recovery_codes' => json_encode(['code-one']),
        ])->save();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('auth.user.id', $user->id)
                ->missing('auth.user.two_factor_secret')
                ->missing('auth.user.two_factor_recovery_codes'));
    }
}
