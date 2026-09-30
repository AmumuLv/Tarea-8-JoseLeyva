<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistorialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'usuario' => $this->whenLoaded('usuario', fn () => [
                'id' => $this->usuario->id,
                'name' => $this->usuario->name,
                'email' => $this->usuario->email,
            ]),
            'tipo_cambio' => $this->tipo_cambio,
            'valor_anterior' => $this->valor_anterior,
            'valor_nuevo' => $this->valor_nuevo,
            'comentario' => $this->comentario,
            'created_at' => $this->created_at,
        ];
    }
}
