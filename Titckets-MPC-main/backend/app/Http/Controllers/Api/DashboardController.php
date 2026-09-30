<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function estadisticas(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Ticket::query();

        if ($user->rol->nombre === 'Tecnico') {
            $query->where('asignado_a', $user->id);
        } elseif ($user->rol->nombre === 'Area Usuaria') {
            $area = $user->area ?? $user->areaInstitucional;
            if ($area) {
                $query->where('area_id', $area->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $estadisticas = [
            'total' => (clone $query)->count(),
            'pendientes' => (clone $query)->where('estado', 'pendiente')->count(),
            'en_proceso' => (clone $query)->where('estado', 'en_proceso')->count(),
            'resueltos' => (clone $query)->where('estado', 'resuelto')->count(),
            'por_area' => (clone $query)->select('area_id', \DB::raw('count(*) as total'))
                ->groupBy('area_id')
                ->with('area')
                ->get(),
        ];

        return response()->json($estadisticas);
    }

    public function ticketsRecientes(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Ticket::with(['area', 'createdBy', 'assignedTo']);

        if ($user->rol->nombre === 'Tecnico') {
            $query->where('asignado_a', $user->id);
        } elseif ($user->rol->nombre === 'Area Usuaria') {
            $area = $user->area ?? $user->areaInstitucional;
            if ($area) {
                $query->where('area_id', $area->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        $tickets = $query->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($tickets);
    }
}
