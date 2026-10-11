<?php

namespace App\Policies\Concerns;

use App\Models\User;

/**
 * Shared policy behaviour for the two "author owns it, everyone can read it"
 * models (annotations and comments). Their policies were byte-identical apart
 * from the type hint.
 */
trait AuthorizesOwnedRecord
{
    public function view(User $user, object $record): bool
    {
        return true;
    }

    public function update(User $user, object $record): bool
    {
        return $this->ownedBy($user, $record);
    }

    public function delete(User $user, object $record): bool
    {
        return $this->ownedBy($user, $record);
    }

    protected function ownedBy(User $user, object $record): bool
    {
        return $record->user_id === $user->id;
    }
}
