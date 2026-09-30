<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketHistorial;
use App\Models\TicketRespuesta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RespuestaController extends Controller
{
    public function index($ticketId): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticketId);
        $respuestas = $ticket->respuestas()->with('usuario')->orderBy('created_at', 'desc')->get();

        return response()->json($respuestas);
    }

    public function store(Request $request, $ticketId): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticketId);

        $request->validate([
            'respuesta' => 'required|string',
        ]);

        $respuesta = TicketRespuesta::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'respuesta' => $request->respuesta,
        ]);

        TicketHistorial::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'tipo_cambio' => 'respuesta',
            'valor_nuevo' => $request->respuesta,
            'comentario' => 'Nueva respuesta agregada',
        ]);

        $respuesta->load('usuario');

        return response()->json($respuesta, 201);
    }
}
