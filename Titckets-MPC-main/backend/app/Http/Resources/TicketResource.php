<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'categoria' => $this->categoria,
            'prioridad' => $this->prioridad,
            'estado' => $this->estado,
            'area' => $this->whenLoaded('area', fn () => [
                'id' => $this->area->id,
                'nombre' => $this->area->nombre,
            ]),
            'createdBy' => $this->whenLoaded('createdBy', fn () => [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
                'email' => $this->createdBy->email,
            ]),
            'assignedTo' => $this->whenLoaded('assignedTo', fn () => [
                'id' => $this->assignedTo->id,
                'name' => $this->assignedTo->name,
                'email' => $this->assignedTo->email,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
