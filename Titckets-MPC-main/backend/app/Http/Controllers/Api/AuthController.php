<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditHelper;
use App\Models\GeneralAudit;
use App\Models\Tecnico;
use App\Models\TecnicoHistorial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = [
            'email' => strtolower($request->email),
            'password' => $request->password,
        ];

        if (!$token = Auth::attempt($credentials)) {
            $user = \App\Models\User::whereRaw('LOWER(email) = LOWER(?)', [$request->email])->first();
            if ($user) {
                GeneralAudit::create([
                    'user_id' => $user->id,
                    'rol' => AuditHelper::getRolDisplay($user),
                    'area' => $user->areaInstitucional->nombre ?? null,
                    'accion' => 'intento_fallido',
                    'descripcion' => "Intento de acceso fallido: {$request->email}",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                $tecnico = Tecnico::where('user_id', $user->id)->first();
                if ($tecnico) {
                    TecnicoHistorial::registrar(
                        $tecnico,
                        'intento_fallido',
                        "Intento de acceso fallido: {$request->email}",
                        null,
                        null,
                        null,
                        $request->ip(),
                        $request->userAgent()
                    );
                }
            }

            return \App\Helpers\ApiError::response(
                $request,
                401,
                'Credenciales incorrectas. Verifica tu correo y contraseña.',
                'AUTH_INVALID_CREDENTIALS'
            );
        }

        $user = Auth::user();

        if ($user->estado !== 'activo') {
            auth()->logout();
            return \App\Helpers\ApiError::response(
                $request,
                403,
                'Su cuenta está desactivada. Contacte al administrador.',
                'USER_INACTIVE'
            );
        }

        $user->load(['areaInstitucional', 'area', 'areaActual.area', 'rol.permisos']);
        $permissions = $user->rol?->permisos?->pluck('nombre')->toArray() ?? [];

        GeneralAudit::create([
            'user_id' => $user->id,
            'rol' => AuditHelper::getRolDisplay($user),
            'area' => $user->areaInstitucional->nombre ?? $user->area->nombre ?? null,
            'accion' => 'inicio_sesion',
            'descripcion' => "Sesion iniciada: {$user->email}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $tecnico = Tecnico::where('user_id', $user->id)->first();
        if ($tecnico) {
            $tecnico->update(['ultimo_acceso' => now()]);
            TecnicoHistorial::registrar(
                $tecnico,
                'inicio_sesion',
                "Sesión iniciada: {$user->email}",
                null,
                null,
                null,
                $request->ip(),
                $request->userAgent()
            );
        }

        return response()->json([
            'token' => $token,
            'user' => $user,
            'permissions' => $permissions,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        GeneralAudit::create([
            'user_id' => $user->id,
            'rol' => AuditHelper::getRolDisplay($user),
            'area' => $user->areaInstitucional->nombre ?? $user->area->nombre ?? null,
            'accion' => 'cierre_sesion',
            'descripcion' => "Sesion cerrada: {$user->email}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $tecnico = Tecnico::where('user_id', $user->id)->first();
        if ($tecnico) {
            TecnicoHistorial::registrar(
                $tecnico,
                'cierre_sesion',
                "Sesión cerrada: {$user->email}",
                null,
                null,
                null,
                $request->ip(),
                $request->userAgent()
            );
        }

        auth()->invalidate(true);
        return response()->json(['message' => 'Sesion cerrada']);
    }

    public function refresh(): JsonResponse
    {
        $token = auth()->refresh(true, true);
        $user = Auth::user()->load(['areaInstitucional', 'area', 'areaActual.area', 'rol.permisos']);
        $permissions = $user->rol?->permisos?->pluck('nombre')->toArray() ?? [];

        return response()->json([
            'token' => $token,
            'user' => $user,
            'permissions' => $permissions,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['areaInstitucional', 'area', 'areaActual.area', 'rol.permisos']);
        $permissions = $user->rol?->permisos?->pluck('nombre')->toArray() ?? [];

        return response()->json([
            'user' => $user,
            'permissions' => $permissions,
        ]);
    }
}
