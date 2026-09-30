<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTecnicoRequest;
use App\Models\Tecnico;
use App\Models\TecnicoHistorial;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TecnicoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Tecnico::seedIniciales();

        $query = Tecnico::with(['user:id,id,nombres,apellidos,email,estado'])
            ->withCount(['tickets' => function ($q) {
                $q->whereIn('tickets.estado', ['pendiente', 'asignado', 'en_proceso', 'en_espera']);
            }]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('alias', 'like', "%{$search}%")
                  ->orWhere('nombres', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('codigo', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q2) use ($search) {
                      $q2->where('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $perPage = (int) $request->get('per_page', 100);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 100;
        }
        $tecnicos = $query->orderBy('codigo')->paginate($perPage);

        return response()->json($tecnicos);
    }

    public function store(StoreTecnicoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $password = $data['password'];
        $email = $data['email'];
        $alias = $data['alias'];

        $user = User::create([
            'nombres' => $data['nombres'] ?? $alias,
            'apellidos' => $data['apellidos'] ?? '-',
            'name' => $alias,
            'email' => $email,
            'password' => Hash::make($password),
            'rol_id' => 2,
            'estado' => 'activo',
        ]);

        $tecnico = Tecnico::create([
            'user_id' => $user->id,
            'alias' => $alias,
            'nombres' => $data['nombres'] ?? null,
            'apellidos' => $data['apellidos'] ?? null,
            'estado' => 'activo',
        ]);

        return response()->json([
            'message' => 'Técnico creado correctamente',
            'data' => $tecnico->load('user'),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $tecnico = Tecnico::with('user:id,id,nombres,apellidos,email,estado,created_at')
            ->withCount(['tickets' => function ($q) {
                $q->whereIn('tickets.estado', ['pendiente', 'asignado', 'en_proceso', 'en_espera']);
            }])
            ->findOrFail($id);

        $stats = $this->getTecnicoStats($id);

        return response()->json(array_merge($tecnico->toArray(), $stats));
    }

    public function update(StoreTecnicoRequest $request, $id): JsonResponse
    {
        $tecnico = Tecnico::findOrFail($id);

        $data = $request->validated();

        $tecnico->update([
            'alias' => $data['alias'] ?? $tecnico->alias,
            'nombres' => $data['nombres'] ?? $tecnico->nombres,
            'apellidos' => $data['apellidos'] ?? $tecnico->apellidos,
            'estado' => $data['estado'] ?? $tecnico->estado,
        ]);

        if ($tecnico->user) {
            $userData = [];
            if (isset($data['nombres'])) $userData['nombres'] = $data['nombres'];
            if (isset($data['apellidos'])) $userData['apellidos'] = $data['apellidos'];
            if (isset($data['email'])) $userData['email'] = $data['email'];
            if (isset($data['alias'])) $userData['name'] = $data['alias'];
            if (isset($data['estado'])) $userData['estado'] = $data['estado'];
            if (!empty($data['password'])) $userData['password'] = Hash::make($data['password']);

            if (!empty($userData)) {
                $tecnico->user->update($userData);
            }
        }

        return response()->json([
            'message' => 'Técnico actualizado correctamente',
            'data' => $tecnico->load('user'),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $tecnico = Tecnico::findOrFail($id);

        $userId = $tecnico->user_id;

        if ($userId) {
            $referencias = Ticket::where('creado_por', $userId)->count()
                + Ticket::where('asignado_a', $userId)->count()
                + \App\Models\TicketHistorial::where('usuario_id', $userId)->count()
                + \App\Models\TicketRespuesta::where('usuario_id', $userId)->count()
                + \App\Models\TicketEvidencia::where('usuario_id', $userId)->count();

            if ($referencias > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar un técnico con tickets o historial asociado. Desactívalo en su lugar.',
                ], 400);
            }
        }

        if ($userId) {
            \Illuminate\Support\Facades\DB::transaction(function () use ($tecnico, $userId) {
                User::where('id', $userId)->delete();
                $tecnico->delete();
            });
        } else {
            $tecnico->delete();
        }

        return response()->json([
            'message' => 'Técnico eliminado correctamente',
        ]);
    }

    public function toggleEstado($id): JsonResponse
    {
        $tecnico = Tecnico::findOrFail($id);
        $tecnico->estado = $tecnico->estado === 'activo' ? 'inactivo' : 'activo';
        $tecnico->save();

        if ($tecnico->user) {
            $tecnico->user->update(['estado' => $tecnico->estado]);
        }

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'data' => $tecnico,
        ]);
    }

    public function all(): JsonResponse
    {
        $tecnicos = Tecnico::with('user:id,id,email,estado')
            ->where('estado', 'activo')
            ->orderBy('alias')
            ->get(['id', 'codigo', 'alias', 'nombres', 'apellidos', 'user_id', 'estado']);

        return response()->json($tecnicos);
    }

    public function stats(): JsonResponse
    {
        $total = Tecnico::count();
        $activos = Tecnico::where('estado', 'activo')->count();
        $disponibles = Tecnico::where('tecnicos.estado', 'activo')
            ->whereDoesntHave('tickets', function ($q) {
                $q->whereIn('tickets.estado', ['pendiente', 'asignado', 'en_proceso', 'en_espera']);
            })->count();
        $ticketsActivos = Ticket::whereIn('estado', ['pendiente', 'asignado', 'en_proceso', 'en_espera'])
            ->whereNotNull('asignado_a')
            ->count();

        return response()->json([
            'total' => $total,
            'activos' => $activos,
            'disponibles' => $disponibles,
            'tickets_activos' => $ticketsActivos,
        ]);
    }

    public function historial($id): JsonResponse
    {
        $tecnico = Tecnico::findOrFail($id);

        $historial = TecnicoHistorial::where('tecnico_id', $id)
            ->with('ticket:id,numero,titulo')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($historial);
    }

    public function statsDetalle($id): JsonResponse
    {
        $tecnico = Tecnico::findOrFail($id);

        $stats = $this->getTecnicoStats($id);

        return response()->json($stats);
    }

    public function resetPassword($id): JsonResponse
    {
        $tecnico = Tecnico::findOrFail($id);

        request()->validate([
            'password' => 'required|string|min:6|max:255',
        ]);

        if ($tecnico->user) {
            $tecnico->user->update([
                'password' => Hash::make(request('password')),
            ]);
        }

        return response()->json([
            'message' => 'Contraseña restablecida correctamente',
        ]);
    }

    private function getTecnicoStats(int $id): array
    {
        $tecnico = Tecnico::find($id);
        if (!$tecnico || !$tecnico->user_id) {
            return [
                'tickets_asignados' => 0,
                'tickets_en_proceso' => 0,
                'tickets_pendientes' => 0,
                'tickets_resueltos' => 0,
                'tickets_cerrados' => 0,
                'tickets_total' => 0,
            ];
        }

        $userId = $tecnico->user_id;

        $asignados = Ticket::where('asignado_a', $userId)
            ->where('estado', 'asignado')
            ->count();

        $enProceso = Ticket::where('asignado_a', $userId)
            ->where('estado', 'en_proceso')
            ->count();

        $pendientes = Ticket::where('asignado_a', $userId)
            ->where('estado', 'pendiente')
            ->count();

        $resueltos = Ticket::where('asignado_a', $userId)
            ->where('estado', 'resuelto')
            ->count();

        $cerrados = Ticket::where('asignado_a', $userId)
            ->where('estado', 'cerrado')
            ->count();

        $total = Ticket::where('asignado_a', $userId)->count();

        return [
            'tickets_asignados' => $asignados,
            'tickets_en_proceso' => $enProceso,
            'tickets_pendientes' => $pendientes,
            'tickets_resueltos' => $resueltos,
            'tickets_cerrados' => $cerrados,
            'tickets_total' => $total,
        ];
    }
}
