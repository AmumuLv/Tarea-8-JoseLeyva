<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditHelper;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Ticket;
use App\Models\TicketHistorial;
use App\Models\TicketEvidencia;
use App\Models\GeneralAudit;
use App\Models\Tecnico;
use App\Models\TecnicoHistorial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Ticket::with(['area', 'createdBy', 'assignedTo', 'evidencias', 'respuestas']);

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

        if ($request->has('estado') && $request->estado !== '') {
            $query->where('estado', $request->estado);
        }

        if ($request->has('categoria') && $request->categoria !== '') {
            $query->where('categoria', $request->categoria);
        }

        if ($request->has('asignado_a') && $request->asignado_a !== '') {
            $query->where('asignado_a', $request->asignado_a);
        }

        if ($request->has('area_id') && $request->area_id !== '') {
            $query->where('area_id', $request->area_id);
        }

        if ($request->filled('fecha_desde') && !\Carbon\Carbon::hasFormat($request->fecha_desde, 'Y-m-d')) {
            return response()->json(['message' => 'fecha_desde debe tener formato Y-m-d'], 422);
        }
        if ($request->filled('fecha_hasta') && !\Carbon\Carbon::hasFormat($request->fecha_hasta, 'Y-m-d')) {
            return response()->json(['message' => 'fecha_hasta debe tener formato Y-m-d'], 422);
        }

        if ($request->has('fecha_desde') && $request->fecha_desde !== '') {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta') && $request->fecha_hasta !== '') {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero', 'like', "%{$search}%")
                  ->orWhere('titulo', 'like', "%{$search}%")
                  ->orWhereHas('createdBy', function ($q2) use ($search) {
                      $q2->where('nombres', 'like', "%{$search}%")
                         ->orWhere('apellidos', 'like', "%{$search}%");
                  })
                  ->orWhereHas('area', function ($q2) use ($search) {
                      $q2->where('nombre', 'like', "%{$search}%");
                  });
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['numero', 'titulo', 'estado', 'categoria', 'created_at'];
        if (!in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) $request->get('per_page', 15);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 15;
        }
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

    public function stats(Request $request): JsonResponse
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

        $all = (clone $query)->count();
        $nuevos = (clone $query)->where('estado', 'pendiente')->count();
        $asignados = (clone $query)->where('estado', 'asignado')->count();
        $enProceso = (clone $query)->where('estado', 'en_proceso')->count();
        $pendientes = (clone $query)->where('estado', 'en_espera')->count();
        $resueltos = (clone $query)->where('estado', 'resuelto')->count();
        $cerrados = (clone $query)->where('estado', 'cerrado')->count();
        $cancelados = (clone $query)->where('estado', 'cancelado')->count();
        $sinAsignar = (clone $query)->whereNull('asignado_a')->whereIn('estado', ['pendiente', 'asignado'])->count();

        $porCategoria = (clone $query)->selectRaw('categoria, count(*) as total')
            ->groupBy('categoria')->pluck('total', 'categoria');

        $porEstado = (clone $query)->selectRaw('estado, count(*) as total')
            ->groupBy('estado')->pluck('total', 'estado');

        $porArea = (clone $query)
            ->join('areas', 'tickets.area_id', '=', 'areas.id')
            ->selectRaw('areas.nombre as area_nombre, count(*) as total')
            ->groupBy('areas.nombre')
            ->pluck('total', 'area_nombre');

        $porTecnico = (clone $query)
            ->join('users', 'tickets.asignado_a', '=', 'users.id')
            ->selectRaw('users.nombres as tecnico_nombres, users.apellidos as tecnico_apellidos, count(*) as total')
            ->whereNotNull('tickets.asignado_a')
            ->groupBy('users.nombres', 'users.apellidos')
            ->get()
            ->mapWithKeys(fn ($r) => [
                trim($r->tecnico_nombres . ' ' . $r->tecnico_apellidos) => (int) $r->total,
            ]);

        return response()->json([
            'total' => $all,
            'nuevos' => $nuevos,
            'asignados' => $asignados,
            'en_proceso' => $enProceso,
            'pendientes' => $pendientes,
            'resueltos' => $resueltos,
            'cerrados' => $cerrados,
            'cancelados' => $cancelados,
            'sin_asignar' => $sinAsignar,
            'por_categoria' => $porCategoria,
            'por_estado' => $porEstado,
            'por_area' => $porArea,
            'por_tecnico' => $porTecnico,
        ]);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $ticket = \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $year = date('Y');
            $lastTicket = Ticket::whereYear('created_at', $year)->lockForUpdate()->max('numero');
            if ($lastTicket) {
                $lastNumber = (int) substr($lastTicket, -6);
                $newNumber = str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '000001';
            }
            $numero = "TKT-{$year}-{$newNumber}";

            $data = $request->validated();
            $data['numero'] = $numero;
            $data['creado_por'] = $request->user()->id;

            if (empty($data['area_id']) && $request->user()?->rol?->nombre === 'Area Usuaria') {
                $area = $request->user()->area ?? $request->user()->areaInstitucional;
                if ($area) {
                    $data['area_id'] = $area->id;
                }
            }

            $ticket = Ticket::create($data);

            TicketHistorial::create([
                'ticket_id' => $ticket->id,
                'usuario_id' => $request->user()->id,
                'tipo_cambio' => 'creacion',
                'valor_nuevo' => $numero,
                'comentario' => 'Ticket creado',
            ]);

            $admin = $request->user();
            GeneralAudit::create([
                'user_id' => $admin->id,
                'rol' => AuditHelper::getRolDisplay($admin),
                'area' => $admin->areaInstitucional->nombre ?? $admin->area->nombre ?? null,
                'accion' => 'creacion_ticket',
                'modelo' => 'Ticket',
                'modelo_id' => $ticket->id,
                'descripcion' => "Ticket {$numero} creado: {$ticket->titulo}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $tecnico = Tecnico::where('user_id', $admin->id)->first();
            if ($tecnico) {
                TecnicoHistorial::registrar(
                    $tecnico,
                    'creacion_ticket',
                    "Ticket {$numero} creado: {$ticket->titulo}",
                    $ticket->id,
                    'Ticket',
                    $ticket->id,
                    $request->ip(),
                    $request->userAgent()
                );
            }

            return $ticket;
        });

        $ticket->load(['area', 'createdBy', 'assignedTo']);

        return response()->json($ticket, 201);
    }

    public function show($id): JsonResponse
    {
        $ticket = Ticket::with(['area', 'createdBy', 'assignedTo', 'historial.usuario', 'respuestas.usuario', 'evidencias.usuario'])
            ->findOrFail($id);

        return response()->json($ticket);
    }

    public function update(UpdateTicketRequest $request, $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $changes = $request->validated();

        $cambiosDetectados = [];
        foreach ($changes as $campo => $valor) {
            if ((string) $ticket->$campo !== (string) $valor) {
                $cambiosDetectados[$campo] = [
                    'anterior' => (string) $ticket->$campo,
                    'nuevo' => (string) $valor,
                ];
            }
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($ticket, $changes, $cambiosDetectados, $request) {
            $ticket->update($changes);

            foreach ($cambiosDetectados as $campo => $vals) {
                TicketHistorial::create([
                    'ticket_id' => $ticket->id,
                    'usuario_id' => $request->user()->id,
                    'tipo_cambio' => 'actualizacion',
                    'valor_anterior' => $vals['anterior'],
                    'valor_nuevo' => $vals['nuevo'],
                    'comentario' => "Campo {$campo} actualizado",
                ]);
            }

            $admin = $request->user();
            GeneralAudit::create([
                'user_id' => $admin->id,
                'rol' => AuditHelper::getRolDisplay($admin),
                'area' => $admin->areaInstitucional->nombre ?? $admin->area->nombre ?? null,
                'accion' => 'edicion_ticket',
                'modelo' => 'Ticket',
                'modelo_id' => $ticket->id,
                'descripcion' => "Ticket {$ticket->numero} actualizado",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        $ticket->load(['area', 'createdBy', 'assignedTo']);

        return response()->json($ticket);
    }

    public function cambiarEstado(Request $request, $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $request->validate([
            'estado' => 'required|in:pendiente,asignado,en_proceso,en_espera,resuelto,cerrado,cancelado',
            'comentario' => 'nullable|string',
        ]);

        $transiciones = [
            'pendiente' => ['asignado', 'cancelado'],
            'asignado' => ['en_proceso', 'en_espera', 'cancelado'],
            'en_proceso' => ['resuelto', 'en_espera', 'cancelado'],
            'en_espera' => ['en_proceso', 'cancelado'],
            'resuelto' => ['cerrado'],
            'cerrado' => [],
            'cancelado' => [],
        ];

        $estadoActual = $ticket->estado;
        $nuevoEstado = $request->estado;

        if (!in_array($nuevoEstado, $transiciones[$estadoActual] ?? [])) {
            return response()->json(['message' => "Transicion no valida: {$estadoActual} -> {$nuevoEstado}"], 422);
        }

        TicketHistorial::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'tipo_cambio' => 'estado',
            'valor_anterior' => $estadoActual,
            'valor_nuevo' => $nuevoEstado,
            'comentario' => $request->comentario ?? "Estado cambiado de {$estadoActual} a {$nuevoEstado}",
        ]);

        $ticket->update(['estado' => $nuevoEstado]);

        $admin = $request->user();
        GeneralAudit::create([
            'user_id' => $admin->id,
            'rol' => AuditHelper::getRolDisplay($admin),
            'area' => $admin->areaInstitucional->nombre ?? $admin->area->nombre ?? null,
            'accion' => 'cambio_estado_ticket',
            'modelo' => 'Ticket',
            'modelo_id' => $ticket->id,
            'descripcion' => "Ticket {$ticket->numero}: estado {$estadoActual} -> {$nuevoEstado}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $tecnico = Tecnico::where('user_id', $admin->id)->first();
        if ($tecnico) {
            TecnicoHistorial::registrar(
                $tecnico,
                'cambio_estado',
                "Ticket {$ticket->numero}: estado {$estadoActual} -> {$nuevoEstado}",
                $ticket->id,
                'Ticket',
                $ticket->id,
                $request->ip(),
                $request->userAgent()
            );
        }

        $ticket->load(['area', 'createdBy', 'assignedTo']);

        return response()->json($ticket);
    }

    public function asignarTecnico(Request $request, $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $request->validate([
            'tecnico_id' => 'required|exists:tecnicos,id',
            'comentario' => 'nullable|string',
        ]);

        $tecnico = Tecnico::find($request->tecnico_id);
        if (!$tecnico || !$tecnico->user_id) {
            abort(422, 'El tecnico seleccionado no tiene un usuario asociado');
        }

        $asignadoAnterior = $ticket->asignado_a;
        $estadoAnterior = $ticket->estado;

        TicketHistorial::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'tipo_cambio' => 'asignacion',
            'valor_anterior' => $asignadoAnterior,
            'valor_nuevo' => $tecnico->user_id,
            'comentario' => $request->comentario ?? 'Tecnico asignado',
        ]);

        $updateData = ['asignado_a' => $tecnico->user_id];
        if ($estadoAnterior === 'pendiente') {
            $updateData['estado'] = 'asignado';
            TicketHistorial::create([
                'ticket_id' => $ticket->id,
                'usuario_id' => $request->user()->id,
                'tipo_cambio' => 'estado',
                'valor_anterior' => $estadoAnterior,
                'valor_nuevo' => 'asignado',
                'comentario' => 'Estado cambiado a asignado',
            ]);
        }

        $ticket->update($updateData);

        $admin = $request->user();
        GeneralAudit::create([
            'user_id' => $admin->id,
            'rol' => AuditHelper::getRolDisplay($admin),
            'area' => $admin->areaInstitucional->nombre ?? $admin->area->nombre ?? null,
            'accion' => 'asignacion_tecnico',
            'modelo' => 'Ticket',
            'modelo_id' => $ticket->id,
            'descripcion' => "Ticket {$ticket->numero}: tecnico asignado",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($tecnico) {
            TecnicoHistorial::registrar(
                $tecnico,
                'asignacion_ticket',
                "Ticket {$ticket->numero} asignado",
                $ticket->id,
                'Ticket',
                $ticket->id,
                $request->ip(),
                $request->userAgent()
            );
        }

        $ticket->load(['area', 'createdBy', 'assignedTo']);

        return response()->json($ticket);
    }

    public function historial($id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $historial = $ticket->historial()->with('usuario')->orderBy('created_at', 'desc')->get();

        return response()->json($historial);
    }

    public function uploadEvidencia(Request $request, $id): JsonResponse
    {
        $request->validate([
            'evidencia' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $ticket = Ticket::findOrFail($id);
        $file = $request->file('evidencia');
        $nombreOriginal = $file->getClientOriginalName();
        $nombreArchivo = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $ruta = $file->storeAs('evidencias', $nombreArchivo, 'public');

        $evidencia = TicketEvidencia::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'nombre_original' => $nombreOriginal,
            'nombre_archivo' => $nombreArchivo,
            'ruta' => $ruta,
            'mime_type' => $file->getMimeType(),
            'tamano' => $file->getSize(),
            'descripcion' => $request->descripcion,
        ]);

        TicketHistorial::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'tipo_cambio' => 'evidencia',
            'valor_nuevo' => $nombreOriginal,
            'comentario' => "Evidencia subida: {$nombreOriginal}",
        ]);

        $evidencia->load('usuario');

        return response()->json($evidencia, 201);
    }

    public function deleteEvidencia(Request $request, $ticketId, $evidenciaId): JsonResponse
    {
        $evidencia = TicketEvidencia::where('ticket_id', $ticketId)->findOrFail($evidenciaId);

        if (Storage::disk('public')->exists($evidencia->ruta)) {
            Storage::disk('public')->delete($evidencia->ruta);
        }

        $evidencia->delete();

        return response()->json(['message' => 'Evidencia eliminada']);
    }
}
