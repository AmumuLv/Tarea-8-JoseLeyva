<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cargo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CargoController extends Controller
{
    public function index(Request $request)
    {
        $query = Cargo::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nombre', 'like', "%{$search}%");
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $perPage = (int) $request->get('per_page', 50);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 50;
        }
        $cargos = $query->orderBy('nombre')->paginate($perPage);

        return response()->json($cargos);
    }

    public function all()
    {
        $cargos = Cargo::where('estado', 'activo')->orderBy('nombre')->get();
        return response()->json($cargos);
    }

    public function store(Request $request)
    {
        $rol = Auth::user()->rol;
        if ($rol->nombre !== 'Administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'nombre' => 'required|string|max:255|unique:cargos,nombre',
            'descripcion' => 'nullable|string|max:500',
        ]);

        $cargo = Cargo::create($request->only(['nombre', 'descripcion']));

        return response()->json([
            'message' => 'Cargo creado correctamente',
            'data' => $cargo,
        ], 201);
    }

    public function show($id)
    {
        $cargo = Cargo::findOrFail($id);
        return response()->json($cargo);
    }

    public function update(Request $request, $id)
    {
        $rol = Auth::user()->rol;
        if ($rol->nombre !== 'Administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $cargo = Cargo::findOrFail($id);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255|unique:cargos,nombre,' . $cargo->id,
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'sometimes|in:activo,inactivo',
        ]);

        $cargo->update($request->only(['nombre', 'descripcion', 'estado']));

        return response()->json([
            'message' => 'Cargo actualizado correctamente',
            'data' => $cargo,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $rol = Auth::user()->rol;
        if ($rol->nombre !== 'Administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $cargo = Cargo::findOrFail($id);
        
        // Verificar si tiene asignaciones activas
        $tieneAsignaciones = $cargo->areaUsuarios()
            ->where('estado_asignacion', 'activo')
            ->exists();
        
        if ($tieneAsignaciones) {
            return response()->json([
                'message' => 'No se puede desactivar. El cargo tiene designaciones activas.',
            ], 422);
        }

        $cargo->update(['estado' => 'inactivo']);

        return response()->json([
            'message' => 'Cargo desactivado correctamente',
            'data' => $cargo,
        ]);
    }
}
