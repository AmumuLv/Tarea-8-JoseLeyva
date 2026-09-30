<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoBien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TipoBienController extends Controller
{
    public function index()
    {
        $tipos = TipoBien::where('estado', 'activo')->orderBy('nombre')->get();
        return response()->json($tipos);
    }

    public function all()
    {
        $tipos = TipoBien::orderBy('nombre')->get();
        return response()->json($tipos);
    }

    public function store(Request $request)
    {
        $rol = Auth::user()->rol;
        if ($rol->nombre !== 'Administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'nombre' => 'required|string|max:255|unique:tipo_bienes,nombre',
            'icono' => 'nullable|string|max:255',
        ]);

        $tipo = TipoBien::create($request->only(['nombre', 'icono']));

        return response()->json([
            'message' => 'Tipo de bien creado correctamente',
            'data' => $tipo,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $rol = Auth::user()->rol;
        if ($rol->nombre !== 'Administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $tipo = TipoBien::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255|unique:tipo_bienes,nombre,' . $tipo->id,
            'icono' => 'nullable|string|max:255',
            'estado' => 'sometimes|in:activo,inactivo',
        ]);

        $tipo->update($request->only(['nombre', 'icono', 'estado']));

        return response()->json([
            'message' => 'Tipo de bien actualizado correctamente',
            'data' => $tipo,
        ]);
    }

    public function destroy($id)
    {
        $rol = Auth::user()->rol;
        if ($rol->nombre !== 'Administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $tipo = TipoBien::findOrFail($id);

        if ($tipo->bienes()->count() > 0) {
            return response()->json(['message' => 'No se puede eliminar: tiene bienes registrados'], 400);
        }

        $tipo->delete();

        return response()->json([
            'message' => 'Tipo de bien eliminado correctamente',
        ]);
    }
}
