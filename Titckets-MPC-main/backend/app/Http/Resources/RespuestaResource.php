<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RespuestaResource extends JsonResource
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
            'respuesta' => $this->respuesta,
            'created_at' => $this->created_at,
        ];
    }
}
