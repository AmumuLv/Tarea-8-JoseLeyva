<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditHelper;
use App\Models\AreaUsuario;
use App\Models\Area;
use App\Models\User;
use App\Models\Cargo;
use App\Models\GeneralAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DesignacionController extends Controller
{
    public function index(Request $request)
    {
        $query = AreaUsuario::with([
            'area',
            'usuario' => fn($q) => $q->with('rol'),
            'cargoRelacion',
            'usuarioDesignador',
        ])->where('estado_asignacion', 'activo');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('area', fn($qq) => $qq->where('nombre', 'like', "%{$search}%"))
                    ->orWhereHas('usuario', fn($qq) => $qq->where('nombres', 'like', "%{$search}%")->orWhere('apellidos', 'like', "%{$search}%"));
            });
        }

        $designaciones = $query->orderBy('fecha_inicio', 'desc')->get();

        return response()->json($designaciones);
    }

    public function store(Request $request)
    {
        $request->validate([
            'area_id' => 'required|exists:areas,id',
            'usuario_id' => 'required|exists:users,id',
            'cargo_id' => 'required|exists:cargos,id',
            'tipo_designacion' => 'required|in:Titular,Encargado',
            'observaciones' => 'nullable|string|max:1000',
            'fecha_inicio' => 'nullable|date',
        ]);

        $area = Area::findOrFail($request->area_id);
        $usuario = User::findOrFail($request->usuario_id);
        $cargo = Cargo::findOrFail($request->cargo_id);

        // Validar cargo único no repetido
        if ($cargo->unico) {
            $existe = AreaUsuario::where('cargo_id', $cargo->id)
                ->where('estado_asignacion', 'activo')
                ->exists();
            if ($existe) {
                return response()->json([
                    'message' => "El cargo {$cargo->nombre} es único y ya está asignado a otra persona.",
                ], 422);
            }
        }

        $authUser = Auth::user();

        return DB::transaction(function () use ($request, $area, $usuario, $cargo, $authUser) {
            $now = now();

            $designacionActiva = AreaUsuario::where('area_id', $request->area_id)
                ->where('estado_asignacion', 'activo')
                ->with('usuario')
                ->first();

            if ($designacionActiva) {
                return response()->json([
                    'message' => "Ya existe una designación activa en {$area->nombre} a nombre de {$designacionActiva->usuario->nombres} {$designacionActiva->usuario->apellidos}. Debe finalizarla antes de crear una nueva.",
                ], 422);
            }

            $designacion = AreaUsuario::create([
                'area_id' => $request->area_id,
                'usuario_id' => $request->usuario_id,
                'cargo_id' => $request->cargo_id,
                'tipo_designacion' => $request->tipo_designacion,
                'usuario_designador_id' => $authUser->id,
                'observaciones' => $request->observaciones,
                'fecha_asignacion' => $request->fecha_inicio ?? $now,
                'fecha_inicio' => $request->fecha_inicio ?? $now,
                'activo' => true,
                'estado_asignacion' => 'activo',
            ]);

            GeneralAudit::create([
                'user_id' => $authUser->id,
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
                'area' => $area->nombre,
                'accion' => 'crear',
                'modelo' => 'AreaUsuario',
                'modelo_id' => $designacion->id,
                'descripcion' => "Designó a {$usuario->nombres} {$usuario->apellidos} como {$request->tipo_designacion} de {$area->nombre} con cargo de {$cargo->nombre}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return response()->json([
                'message' => 'Designación creada correctamente',
                'data' => $designacion->load(['area', 'usuario', 'cargoRelacion', 'usuarioDesignador']),
            ], 201);
        });
    }

    public function show($id)
    {
        $designacion = AreaUsuario::with([
            'area',
            'usuario' => fn($q) => $q->with('rol'),
            'cargoRelacion',
            'usuarioDesignador',
        ])->findOrFail($id);

        return response()->json($designacion);
    }

    public function update(Request $request, $id)
    {
        $designacion = AreaUsuario::with(['area', 'usuario', 'cargoRelacion'])->findOrFail($id);

        if ($designacion->estado_asignacion !== 'activo') {
            return response()->json(['message' => 'Solo se pueden editar designaciones activas.'], 422);
        }

        $request->validate([
            'usuario_id' => 'sometimes|exists:users,id',
            'cargo_id' => 'sometimes|exists:cargos,id',
            'tipo_designacion' => 'sometimes|in:Titular,Encargado',
            'observaciones' => 'nullable|string|max:1000',
            'fecha_inicio' => 'sometimes|date',
        ]);

        // Validar cargo único no repetido (si se está cambiando el cargo)
        if ($request->filled('cargo_id') && $request->cargo_id != $designacion->cargo_id) {
            $nuevoCargo = Cargo::findOrFail($request->cargo_id);
            if ($nuevoCargo->unico) {
                $existe = AreaUsuario::where('cargo_id', $nuevoCargo->id)
                    ->where('estado_asignacion', 'activo')
                    ->where('id', '!=', $designacion->id)
                    ->exists();
                if ($existe) {
                    return response()->json([
                        'message' => "El cargo {$nuevoCargo->nombre} es único y ya está asignado a otra persona.",
                    ], 422);
                }
            }
        }

        $designacion->update($request->only(['usuario_id', 'cargo_id', 'tipo_designacion', 'observaciones', 'fecha_inicio']));
        $designacion->load(['area', 'usuario', 'cargoRelacion', 'usuarioDesignador']);

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
            'area' => $designacion->area->nombre,
            'accion' => 'actualizar',
            'modelo' => 'AreaUsuario',
            'modelo_id' => $designacion->id,
            'descripcion' => "Actualizó designación de {$designacion->usuario->nombres} {$designacion->usuario->apellidos} en {$designacion->area->nombre}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json([
            'message' => 'Designación actualizada correctamente',
            'data' => $designacion,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        return response()->json([
            'message' => 'No se pueden eliminar designaciones. Use la opción de finalizar.',
        ], 400);
    }

    public function finalizar(Request $request, $id)
    {
        $designacion = AreaUsuario::with(['area', 'usuario'])->findOrFail($id);

        if ($designacion->estado_asignacion !== 'activo') {
            return response()->json(['message' => 'Esta designación ya fue finalizada.'], 422);
        }

        $now = now();

        $designacion = DB::transaction(function () use ($designacion, $now) {
            $designacion->update([
                'fecha_fin' => $now,
                'estado_asignacion' => 'finalizado',
                'activo' => false,
            ]);

            return $designacion;
        });

        $designacion->load(['area', 'usuario', 'cargoRelacion']);

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
            'area' => $designacion->area->nombre ?? '',
            'accion' => 'finalizar',
            'modelo' => 'AreaUsuario',
            'modelo_id' => $designacion->id,
            'descripcion' => "Finalizó Designación de {$designacion->usuario->nombres} {$designacion->usuario->apellidos} en {$designacion->area->nombre}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json([
            'message' => 'Designación finalizada correctamente',
            'data' => $designacion,
        ]);
    }

    public function historial($areaId)
    {
        $historial = AreaUsuario::with([
            'usuario' => fn($q) => $q->with('rol'),
            'cargoRelacion',
            'usuarioDesignador',
        ])
            ->where('area_id', $areaId)
            ->whereDoesntHave('usuario', fn ($q) => $q->where('cargo', 'Área Institucional'))
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        return response()->json($historial);
    }

    public function historialPersonal($usuarioId)
    {
        $historial = AreaUsuario::with([
            'area',
            'cargoRelacion',
        ])
            ->where('usuario_id', $usuarioId)
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        return response()->json($historial);
    }

    public function areasDisponibles()
    {
        $areasConDesignacionActiva = AreaUsuario::where('estado_asignacion', 'activo')
            ->pluck('area_id')
            ->unique();

        $areas = Area::where('estado', 'activo')
            ->whereNotIn('id', $areasConDesignacionActiva)
            ->orderBy('nombre')
            ->get();

        return response()->json($areas);
    }

    public function usuariosDisponibles(Request $request)
    {
        $usuariosConDesignacionActiva = AreaUsuario::where('estado_asignacion', 'activo')
            ->when($request->filled('exclude_designacion_id'), function ($q) use ($request) {
                $q->where('id', '!=', $request->exclude_designacion_id);
            })
            ->pluck('usuario_id')
            ->unique();

        $usuarios = User::where('estado', 'activo')
            ->where('actualmente_laborando', true)
            ->whereHas('rol', fn($q) => $q->where('nombre', '!=', 'Administrador')->where('nombre', '!=', 'Area Usuaria')->where('nombre', '!=', 'Tecnico'))
            ->whereNotIn('id', $usuariosConDesignacionActiva)
            ->with('rol')
            ->orderBy('nombres')
            ->get();

        return response()->json($usuarios);
    }

    public function cargosDisponibles(Request $request)
    {
        $cargos = Cargo::where('estado', 'activo')->orderBy('nombre')->get();

        $usedUnicoIds = AreaUsuario::where('estado_asignacion', 'activo')
            ->whereHas('cargoRelacion', fn($q) => $q->where('unico', true))
            ->when($request->filled('exclude_designacion_id'), function ($q) use ($request) {
                $q->where('id', '!=', $request->exclude_designacion_id);
            })
            ->pluck('cargo_id')
            ->unique();

        $cargos = $cargos->map(function ($cargo) use ($usedUnicoIds) {
            $cargo->disponible = $cargo->unico ? !$usedUnicoIds->contains($cargo->id) : true;
            return $cargo;
        });

        return response()->json($cargos);
    }
}
