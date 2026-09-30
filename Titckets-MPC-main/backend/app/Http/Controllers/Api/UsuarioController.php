<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditHelper;
use App\Models\User;
use App\Models\GeneralAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['rol', 'areaActual.area'])
            ->where(function ($q) {
                $q->where('cargo', '!=', 'Área Institucional')
                  ->orWhereNull('cargo')
                  ->orWhere('cargo', '');
            });

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if ($request->filled('rol_id')) {
            $query->where('rol_id', $request->rol_id);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $perPage = (int) $request->get('per_page', 15);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 15;
        }
        $usuarios = $query->orderBy('nombres')->paginate($perPage);

        return response()->json($usuarios);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'nullable|string|max:15',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:users,email',
            'correo_institucional' => 'nullable|email|max:255|unique:users,correo_institucional',
            'fecha_ingreso' => 'required|date',
            'fecha_cese' => 'nullable|date|after_or_equal:fecha_ingreso',
            'actualmente_laborando' => 'required|boolean',
            'estado' => 'nullable|in:activo,inactivo',
            'foto' => 'nullable|file|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $personalRoleId = \App\Models\Role::where('nombre', 'Personal')->first()?->id ?? 4;
        $existe = User::where('nombres', $request->nombres)
            ->where('apellidos', $request->apellidos)
            ->where('rol_id', $personalRoleId)
            ->first();

        if ($existe) {
            return response()->json([
                'message' => 'Ya existe una persona registrada con esos nombres y apellidos',
            ], 422);
        }

        if ($request->filled('dni')) {
            $dniExiste = User::where('dni', $request->dni)->where('rol_id', $personalRoleId)->first();
            if ($dniExiste) {
                return response()->json([
                    'message' => 'Ya existe una persona registrada con ese DNI',
                ], 422);
            }
        }

        $data = $request->only([
            'nombres', 'apellidos', 'dni', 'telefono', 'email', 'correo_institucional',
            'fecha_ingreso', 'fecha_cese', 'actualmente_laborando', 'estado',
        ]);
        $data['rol_id'] = $personalRoleId;
        $data['name'] = trim($request->nombres . ' ' . $request->apellidos);

        if ($request->boolean('actualmente_laborando')) {
            $data['estado'] = 'activo';
            $data['fecha_cese'] = null;
        } else {
            $data['estado'] = 'inactivo';
        }

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = 'user_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/usuarios'), $filename);
            $data['foto'] = 'uploads/usuarios/' . $filename;
        }

        $usuario = User::create($data);

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay($authUser),
            'area' => '',
            'accion' => 'crear',
            'modelo' => 'User',
            'modelo_id' => $usuario->id,
            'descripcion' => "Creó el usuario: {$usuario->nombres} {$usuario->apellidos}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'data' => $usuario->load('rol'),
        ], 201);
    }

    public function show($id)
    {
        $usuario = User::with(['rol', 'asignaciones.area' => function ($q) {
            $q->where('activo', true);
        }])->findOrFail($id);

        return response()->json($usuario);
    }

    public function update(Request $request, $id)
    {
        $authUser = Auth::user();
        $usuario = User::findOrFail($id);

        $request->validate([
            'nombres' => 'sometimes|required|string|max:255',
            'apellidos' => 'sometimes|required|string|max:255',
            'dni' => 'sometimes|nullable|string|max:15',
            'telefono' => 'sometimes|nullable|string|max:20',
            'correo_institucional' => 'sometimes|nullable|email|max:255|unique:users,correo_institucional,' . $id,
            'fecha_ingreso' => 'sometimes|required|date',
            'fecha_cese' => 'nullable|date|after_or_equal:fecha_ingreso',
            'actualmente_laborando' => 'sometimes|boolean',
            'estado' => 'sometimes|nullable|in:activo,inactivo',
            'foto' => 'nullable|file|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $nombres = $request->get('nombres', $usuario->nombres);
        $apellidos = $request->get('apellidos', $usuario->apellidos);

        $personalRoleId = \App\Models\Role::where('nombre', 'Personal')->first()?->id ?? 4;
        $existe = User::where('nombres', $nombres)
            ->where('apellidos', $apellidos)
            ->where('rol_id', $personalRoleId)
            ->where('id', '!=', $id)
            ->first();

        if ($existe) {
            return response()->json([
                'message' => 'Ya existe otra persona registrada con esos nombres y apellidos',
            ], 422);
        }

        if ($request->filled('dni')) {
            $dniExiste = User::where('dni', $request->dni)->where('rol_id', $personalRoleId)->where('id', '!=', $id)->first();
            if ($dniExiste) {
                return response()->json([
                    'message' => 'Ya existe otra persona registrada con ese DNI',
                ], 422);
            }
        }

        $data = $request->only([
            'nombres', 'apellidos', 'dni', 'telefono', 'correo_institucional',
            'fecha_ingreso', 'fecha_cese', 'actualmente_laborando', 'estado',
        ]);

        if ($request->has('actualmente_laborando')) {
            if ($request->boolean('actualmente_laborando')) {
                $data['estado'] = 'activo';
                $data['fecha_cese'] = null;
            } else {
                $data['estado'] = 'inactivo';
            }
        }

        if ($request->boolean('remove_foto') && $usuario->foto) {
            if (file_exists(public_path($usuario->foto))) {
                unlink(public_path($usuario->foto));
            }
            $usuario->foto = null;
            $usuario->save();
        }

        if ($request->hasFile('foto')) {
            if ($usuario->foto && file_exists(public_path($usuario->foto))) {
                unlink(public_path($usuario->foto));
            }
            $file = $request->file('foto');
            $filename = 'user_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/usuarios'), $filename);
            $data['foto'] = 'uploads/usuarios/' . $filename;
        }

        $usuario->update($data);

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay($authUser),
            'area' => '',
            'accion' => 'actualizar',
            'modelo' => 'User',
            'modelo_id' => $usuario->id,
            'descripcion' => "Actualizó el usuario: {$usuario->nombres} {$usuario->apellidos}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'data' => $usuario->load('rol'),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $authUser = Auth::user();
        $usuario = User::findOrFail($id);

        if ($usuario->rol->nombre === 'Administrador') {
            return response()->json([
                'message' => 'No se puede eliminar un usuario administrador',
            ], 400);
        }

        $referencias = \App\Models\Ticket::where('creado_por', $usuario->id)->count()
            + \App\Models\Ticket::where('asignado_a', $usuario->id)->count()
            + \App\Models\TicketHistorial::where('usuario_id', $usuario->id)->count()
            + \App\Models\TicketRespuesta::where('usuario_id', $usuario->id)->count()
            + \App\Models\TicketEvidencia::where('usuario_id', $usuario->id)->count();

        if ($referencias > 0) {
            return response()->json([
                'message' => 'No se puede eliminar un usuario con tickets o historial asociado. Desactívalo en su lugar.',
            ], 400);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($usuario) {
            $usuario->asignaciones()->delete();

            if ($usuario->foto && file_exists(public_path($usuario->foto))) {
                unlink(public_path($usuario->foto));
            }

            $usuario->delete();
        });

        GeneralAudit::create([
            'user_id' => Auth::id(),
            'rol' => AuditHelper::getRolDisplay($authUser),
            'area' => '',
            'accion' => 'eliminar',
            'modelo' => 'User',
            'modelo_id' => $usuario->id,
            'descripcion' => "Eliminó el usuario: {$usuario->nombres} {$usuario->apellidos}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    public function toggleEstado(Request $request, $id)
    {
        $usuario = User::findOrFail($id);
        $usuario->estado = $usuario->estado === 'activo' ? 'inactivo' : 'activo';
        $usuario->save();

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'data' => $usuario,
        ]);
    }

    public function tecnicos(Request $request)
    {
        $query = User::with(['rol'])
            ->whereHas('rol', function ($q) {
                $q->where('nombre', 'Tecnico');
            })
            ->where('estado', 'activo')
            ->where(function ($q) {
                $q->where('cargo', '!=', 'Área Institucional')
                  ->orWhereNull('cargo')
                  ->orWhere('cargo', '');
            });

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $tecnicos = $query->orderBy('nombres')->get();

        return response()->json($tecnicos);
    }
}
