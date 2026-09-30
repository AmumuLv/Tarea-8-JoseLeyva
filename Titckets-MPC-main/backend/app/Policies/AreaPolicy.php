<?php

namespace App\Policies;

use App\Models\Area;
use App\Models\User;

class AreaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->rol->nombre === 'admin';
    }

    public function update(User $user, Area $area): bool
    {
        return $user->rol->nombre === 'admin';
    }

    public function delete(User $user, Area $area): bool
    {
        return $user->rol->nombre === 'admin';
    }
}
