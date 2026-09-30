<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\AreaUsuario;
use App\Models\Ticket;
use App\Models\UserAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AreaProfileController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['areaActual.area', 'areaInstitucional', 'rol']);

        $asignacion = $user->areaActual;
        $area = $asignacion?->area ?? $user->areaInstitucional;

        if (!$area) {
            return response()->json(['message' => 'No tienes un área asignada'], 404);
        }

        $responsable = null;
        $asignacionArea = null;

        if ($asignacion && $asignacion->usuario_id) {
            $responsable = \App\Models\User::find($asignacion->usuario_id);
            $asignacionArea = $asignacion;
        } else {
            $asignacionArea = AreaUsuario::where('area_id', $area->id)
                ->where('estado_asignacion', 'activo')
                ->with(['usuario', 'cargoRelacion'])
                ->first();
            if ($asignacionArea && $asignacionArea->usuario) {
                $responsable = $asignacionArea->usuario;
            }
        }

        $ticketsCreados = Ticket::where('creado_por', $user->id)->count();
        $ticketsAbiertos = Ticket::where('area_id', $area->id)
            ->whereIn('estado', ['pendiente', 'asignado', 'en_proceso', 'en_espera'])
            ->count();
        $ticketsCerrados = Ticket::where('area_id', $area->id)
            ->whereIn('estado', ['resuelto', 'cerrado'])
            ->count();

        $ultimoAcceso = UserAudit::where('user_id', $user->id)
            ->where('accion', 'inicio_sesion')
            ->latest('created_at')
            ->first();

        return response()->json([
            'area' => [
                'id' => $area->id,
                'nombre' => $area->nombre,
                'correo' => $area->correo,
                'descripcion' => $area->descripcion,
                'estado' => $area->estado,
                'created_at' => $area->created_at,
            ],
            'responsable' => $responsable ? [
                'nombres' => $responsable->nombres,
                'apellidos' => $responsable->apellidos,
                'cargo' => $asignacionArea->cargoRelacion?->nombre ?? $responsable->cargo,
                'telefono' => $responsable->telefono,
                'dni' => $responsable->dni,
            ] : null,
            'asignacion' => $asignacionArea ? [
                'fecha_asignacion' => $asignacionArea->fecha_asignacion,
                'cargo' => $asignacionArea->cargoRelacion?->nombre ?? $asignacionArea->cargo,
            ] : null,
            'actividad' => [
                'ultimo_acceso' => $ultimoAcceso?->created_at,
                'ip_ultimo_acceso' => $ultimoAcceso?->ip_address,
                'tickets_creados' => $ticketsCreados,
                'tickets_abiertos' => $ticketsAbiertos,
                'tickets_cerrados' => $ticketsCerrados,
            ],
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'La contraseña actual es incorrecta'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }
}
