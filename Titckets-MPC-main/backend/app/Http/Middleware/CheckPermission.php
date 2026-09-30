<?php

namespace App\Http\Middleware;

use App\Services\PermisoService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    protected PermisoService $permisoService;

    public function __construct(PermisoService $permisoService)
    {
        $this->permisoService = $permisoService;
    }

    public function handle(Request $request, Closure $next, string ...$permisos): Response
    {
        $user = $request->user();

        if (!$user) {
            return \App\Helpers\ApiError::response(
                $request,
                401,
                'No has iniciado sesión. Inicia sesión para continuar.',
                'AUTH_UNAUTHORIZED'
            );
        }

        // Admin bypass
        if ($user->rol && $user->rol->nombre === 'Administrador') {
            return $next($request);
        }

        foreach ($permisos as $permiso) {
            if ($this->permisoService->userHasPermission($user, $permiso)) {
                return $next($request);
            }
        }

        return \App\Helpers\ApiError::response(
            $request,
            403,
            'No tienes permisos para realizar esta acción.',
            'AUTH_FORBIDDEN'
        );
    }
}
