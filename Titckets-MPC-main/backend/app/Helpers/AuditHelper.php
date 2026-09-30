<?php

namespace App\Helpers;

use App\Models\User;

class AuditHelper
{
    public static function getRolDisplay(User $user): string
    {
        $area = $user->areaInstitucional ?? $user->area;
        if ($area) {
            return $area->nombre;
        }
        return $user->rol?->nombre ?? '';
    }
}
