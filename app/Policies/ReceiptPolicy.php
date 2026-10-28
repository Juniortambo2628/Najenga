<?php

namespace App\Policies;

use App\Models\Receipt;
use App\Models\User;

/**
 * A receipt follows its expense: whoever may see or change the expense may
 * see or change its receipt.
 */
class ReceiptPolicy
{
    public function view(User $user, Receipt $receipt): bool
    {
        return $user->can('view', $receipt->expense);
    }

    public function update(User $user, Receipt $receipt): bool
    {
        return $user->can('update', $receipt->expense);
    }

    public function delete(User $user, Receipt $receipt): bool
    {
        return $user->can('delete', $receipt->expense);
    }
}
