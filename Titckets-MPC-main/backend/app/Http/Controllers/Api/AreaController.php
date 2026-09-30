<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditHelper;
use App\Models\Area;
use App\Models\AreaUsuario;
use App\Models\User;
use App\Models\GeneralAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AreaController extends Controller
{
    public function index(Request $request)
    {
        $query = Area::withCount(['tickets', 'bienes'])
            ->with(['asignaciones' => function ($q) {
                $q->where('estado_asignacion', 'activo')->with('usuario');
            }]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('correo', 'like', "%{$search}%")
                  ->orWhereHas('asignaciones.usuario', function ($q2) use ($search) {
                      $q2->where('nombres', 'like', "%{$search}%")
                         ->orWhere('apellidos', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = (int) $request->get('per_page', 100);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 100;
        }
        $areas = $query->orderBy('nombre')->paginate($perPage);

        return response()->json($areas);
    }

    public function stats()
    {
        $total = Area::count();
        $conResponsable = Area::whereHas('asignaciones', function ($q) {
            $q->where('estado_asignacion', 'activo');
        })->count();
        $sinResponsable = $total - $conResponsable;
        $ticketsActivos = \App\Models\Ticket::whereIn('estado', ['pendiente', 'asignado', 'en_proceso', 'en_espera'])->count();

        return response()->json([
            'total' => $total,
            'con_responsable' => $conResponsable,
            'sin_responsable' => $sinResponsable,
            'tickets_activos' => $ticketsActivos,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:areas,nombre',
            'correo' => 'required|email|max:255',
            'password_correo' => 'required|string|min:6|max:255',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activo,inactivo',
        ]);

        $correo = strtolower($request->correo);

        $rolArea = \App\Models\Role::where('nombre', 'Area Usuaria')->first();
        if (!$rolArea) {
            return response()->json(['message' => 'Rol Area Usuaria no encontrado'], 500);
        }

        if (User::whereRaw('LOWER(email) = LOWER(?)', [$correo])->exists()) {
            return response()->json(['message' => 'El correo ya está en uso por otra cuenta'], 422);
        }

        $area = DB::transaction(function () use ($request, $correo, $rolArea) {
            $area = Area::create([
                'nombre' => $request->nombre,
                'correo' => $correo,
                'descripcion' => $request->descripcion,
                'estado' => $request->estado ?? 'activo',
            ]);

            User::create([
                'nombres' => $area->nombre,
                'apellidos' => '',
                'name' => $area->nombre,
                'email' => $area->correo,
                'username' => $area->correo,
                'password' => Hash::make($request->password_correo),
                'dni' => 'AREA-' . str_pad($area->id, 3, '0', STR_PAD_LEFT),
                'cargo' => 'Área Institucional',
                'rol_id' => $rolArea->id,
                'estado' => 'activo',
            ]);

            return $area;
        });

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
            'area' => '',
            'accion' => 'crear',
            'modelo' => 'Area',
            'modelo_id' => $area->id,
            'descripcion' => "Creó el área: {$area->nombre}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Área creada correctamente',
            'data' => $area,
        ], 201);
    }

    public function show($id)
    {
        // Excluir usuarios pseudo "Área Institucional" (dni 900000xx) del historial y asignaciones
        $soloPersonalReal = fn ($q) => $q->whereDoesntHave('usuario', fn ($qq) => $qq->where('cargo', 'Área Institucional'));

        $area = Area::with([
            'jefeActual.usuario',
            'tickets.createdBy',
            'tickets.assignedTo',
            'historialResponsables' => $soloPersonalReal,
            'historialResponsables.usuarioDesignador',
            'asignaciones' => $soloPersonalReal,
            'asignaciones.usuario',
        ])->withCount('tickets')->findOrFail($id);

        return response()->json($area);
    }

    public function update(Request $request, $id)
    {
        $area = Area::findOrFail($id);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255|unique:areas,nombre,' . $area->id,
            'correo' => 'sometimes|required|email|max:255',
            'password_correo' => 'sometimes|nullable|string|min:6|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'estado' => 'sometimes|nullable|in:activo,inactivo',
        ]);

        $updateData = $request->only([
            'nombre', 'correo', 'descripcion', 'estado',
        ]);

        if (isset($updateData['correo'])) {
            $updateData['correo'] = strtolower($updateData['correo']);
        }

        if (isset($updateData['correo']) && $updateData['correo'] !== strtolower($area->correo)) {
            if (User::whereRaw('LOWER(email) = LOWER(?)', [$updateData['correo']])->exists()) {
                return response()->json(['message' => 'El correo ya está en uso por otra cuenta'], 422);
            }
        }

        $linkedUser = User::whereRaw('LOWER(email) = LOWER(?)', [$area->correo])
            ->orWhereRaw('LOWER(username) = LOWER(?)', [$area->correo])
            ->first();

        $nuevaPassword = $request->filled('password_correo') ? Hash::make($request->password_correo) : null;
        $correoFinal = strtolower($updateData['correo'] ?? $area->correo);

        DB::transaction(function () use ($area, $updateData, $linkedUser, $nuevaPassword, $correoFinal) {
            $area->update($updateData);

            if ($linkedUser) {
                $userUpdate = ['nombres' => $area->nombre, 'name' => $area->nombre];

                if (isset($updateData['correo']) && strtolower($linkedUser->email) !== $updateData['correo']) {
                    $userUpdate['email'] = $updateData['correo'];
                    $userUpdate['username'] = $updateData['correo'];
                }

                if ($nuevaPassword) {
                    $userUpdate['password'] = $nuevaPassword;
                }

                $linkedUser->update($userUpdate);
            } elseif ($nuevaPassword && $correoFinal) {
                // El área no tiene cuenta institucional (ej. áreas sembradas sin usuario):
                // crearla para que la contraseña de acceso permita iniciar sesión.
                $rolArea = \App\Models\Role::where('nombre', 'Area Usuaria')->first();
                if ($rolArea) {
                    User::create([
                        'nombres' => $area->nombre,
                        'apellidos' => '',
                        'name' => $area->nombre,
                        'email' => $correoFinal,
                        'username' => $correoFinal,
                        'password' => $nuevaPassword,
                        'dni' => 'AREA-' . str_pad($area->id, 3, '0', STR_PAD_LEFT),
                        'cargo' => 'Área Institucional',
                        'rol_id' => $rolArea->id,
                        'estado' => 'activo',
                    ]);
                }
            }
        });

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
            'area' => '',
            'accion' => 'actualizar',
            'modelo' => 'Area',
            'modelo_id' => $area->id,
            'descripcion' => "Actualizó el área: {$area->nombre}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Área actualizada correctamente',
            'data' => $area,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $area = Area::findOrFail($id);

        if ($area->tickets()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el área porque tiene tickets asociados',
            ], 400);
        }

        if ($area->bienes()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el área porque tiene bienes asociados',
            ], 400);
        }

        $linkedUser = User::whereRaw('LOWER(email) = LOWER(?)', [$area->correo])
            ->orWhereRaw('LOWER(username) = LOWER(?)', [$area->correo])
            ->first();

        DB::transaction(function () use ($area, $linkedUser) {
            if ($linkedUser) {
                $linkedUser->delete();
            }

            $area->asignaciones()->delete();

            $area->delete();
        });

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay(Auth::user()),
            'area' => '',
            'accion' => 'eliminar',
            'modelo' => 'Area',
            'modelo_id' => $area->id,
            'descripcion' => "Eliminó el área: {$area->nombre}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Área eliminada correctamente']);
    }
}
