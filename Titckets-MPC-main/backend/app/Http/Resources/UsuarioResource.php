<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'area' => $this->whenLoaded('area', fn () => [
                'id' => $this->area->id,
                'nombre' => $this->area->nombre,
            ]),
            'rol' => $this->whenLoaded('rol', fn () => [
                'id' => $this->rol->id,
                'nombre' => $this->rol->nombre,
            ]),
            'estado' => $this->estado,
            'foto' => $this->foto,
            'ultimo_acceso_at' => $this->ultimo_acceso_at,
            'created_at' => $this->created_at,
        ];
    }
}
