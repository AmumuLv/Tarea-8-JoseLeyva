<?php

namespace App\Services;

use App\Models\User;

class PermisoService
{
    public function userHasPermission(User $user, string $permisoNombre): bool
    {
        return $user->rol
            ? $user->rol->permisos->contains('nombre', $permisoNombre)
            : false;
    }

    public function getUserPermissions(User $user): array
    {
        if (!$user->rol) {
            return [];
        }

        return $user->rol->permisos->pluck('nombre')->toArray();
    }
}
