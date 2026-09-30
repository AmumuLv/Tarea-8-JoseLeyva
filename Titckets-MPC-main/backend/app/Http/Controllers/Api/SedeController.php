<?php

namespace App\Http\Controllers\Api;

use App\Helpers\AuditHelper;
use App\Http\Controllers\Controller;
use App\Models\GeneralAudit;
use App\Models\Sede;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SedeController extends Controller
{
    public function index(Request $request)
    {
        $query = Sede::withCount('bienes');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('direccion', 'like', "%{$search}%");
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $perPage = (int) $request->get('per_page', 100);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 100;
        }
        $sedes = $query->orderBy('nombre')->paginate($perPage);

        return response()->json($sedes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:sedes,nombre',
            'direccion' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        $sede = Sede::create([
            'nombre' => $request->nombre,
            'direccion' => $request->direccion,
            'descripcion' => $request->descripcion,
            'estado' => $request->estado ?? 'activo',
        ]);

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
            'area' => '',
            'accion' => 'crear',
            'modelo' => 'Sede',
            'modelo_id' => $sede->id,
            'descripcion' => "Creó la sede: {$sede->nombre}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Sede creada correctamente',
            'data' => $sede,
        ], 201);
    }

    public function show($id)
    {
        $sede = Sede::withCount('bienes')->findOrFail($id);

        return response()->json($sede);
    }

    public function update(Request $request, $id)
    {
        $sede = Sede::findOrFail($id);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255|unique:sedes,nombre,' . $sede->id,
            'direccion' => 'sometimes|nullable|string|max:255',
            'descripcion' => 'sometimes|nullable|string|max:500',
            'estado' => 'sometimes|nullable|in:activo,inactivo',
        ]);

        $sede->update($request->only(['nombre', 'direccion', 'descripcion', 'estado']));

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
            'area' => '',
            'accion' => 'actualizar',
            'modelo' => 'Sede',
            'modelo_id' => $sede->id,
            'descripcion' => "Actualizó la sede: {$sede->nombre}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Sede actualizada correctamente',
            'data' => $sede,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $sede = Sede::findOrFail($id);

        if ($sede->bienes()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar la sede porque tiene bienes asociados',
            ], 400);
        }

        $sede->delete();

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
            'area' => '',
            'accion' => 'eliminar',
            'modelo' => 'Sede',
            'modelo_id' => $sede->id,
            'descripcion' => "Eliminó la sede: {$sede->nombre}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Sede eliminada correctamente']);
    }
}
