<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'correo',
        'descripcion',
        'estado',
    ];

    public function asignaciones()
    {
        return $this->hasMany(AreaUsuario::class);
    }

    public function historialResponsables()
    {
        return $this->hasMany(AreaUsuario::class)->with('usuario')->orderBy('fecha_inicio', 'desc');
    }

    public function jefeActual()
    {
        return $this->hasOne(AreaUsuario::class)->where('estado_asignacion', 'activo');
    }

    public function jefe()
    {
        return $this->hasOneThrough(
            User::class,
            AreaUsuario::class,
            'area_id',
            'id',
            'id',
            'usuario_id'
        )->where('area_usuario.estado_asignacion', 'activo');
    }

    public function bienes()
    {
        return $this->hasMany(Bien::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
