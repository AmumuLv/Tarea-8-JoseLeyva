<?php

namespace App\Policies;

use App\Models\User;

class UsuarioPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->rol->nombre === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->rol->nombre === 'admin';
    }

    public function update(User $user, User $model): bool
    {
        return $user->rol->nombre === 'admin';
    }

    public function delete(User $user, User $model): bool
    {
        return $user->rol->nombre === 'admin';
    }
}
