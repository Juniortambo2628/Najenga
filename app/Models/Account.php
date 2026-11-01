<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Okjt\Kit\Accounts\HasTeam;

/**
 * A client's account (the OKJT kit's accounts): it holds the client's
 * projects; the client owns it, and the managers of its projects are its
 * staff, each an owner of the projects they manage.
 */
class Account extends Model
{
    use HasTeam;

    protected $fillable = ['name'];

    /** The account $client owns, made the first time they have a project. */
    public static function ownedBy(User $client): self
    {
        $account = $client->accounts()->wherePivot('role', config('okjt.accounts.owner_role'))->orderBy('accounts.id')->first();
        if ($account) {
            return $account;
        }

        $account = static::create(['name' => trim($client->name) ?: $client->email]);
        $account->members()->attach($client->id, ['role' => config('okjt.accounts.owner_role')]);

        return $account;
    }

    /** Make $user staff on this account (owner of the projects they're given), unless they are already in it. */
    public function addStaff(User $user): void
    {
        if (! $this->members()->whereKey($user->id)->exists()) {
            $fields = config('okjt.accounts.fields');
            $this->members()->attach($user->id, [
                'role' => config('okjt.accounts.staff_role'),
                $fields['all'] => false,
                $fields['role'] => 'owner',
            ]);
        }
    }
}
