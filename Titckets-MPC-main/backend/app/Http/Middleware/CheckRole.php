<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $rol): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        if (!$user->rol || $user->rol->nombre !== $rol) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return $next($request);
    }
}
