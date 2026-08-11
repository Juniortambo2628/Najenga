<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;
use App\Traits\BelongsToUserPolicy;

class ExpensePolicy
{
    use BelongsToUserPolicy;

    public function view($user, $model): bool
    {
        return $this->userOwns($user, $model);
    }
}
