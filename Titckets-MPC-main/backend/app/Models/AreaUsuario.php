<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AreaUsuario extends Model
{
    use HasFactory;

    protected $table = 'area_usuario';

    protected $fillable = [
        'area_id',
        'usuario_id',
        'cargo',
        'cargo_id',
        'tipo_designacion',
        'usuario_designador_id',
        'observaciones',
        'fecha_asignacion',
        'activo',
        'fecha_inicio',
        'fecha_fin',
        'estado_asignacion',
    ];

    protected $casts = [
        'fecha_asignacion' => 'date',
        'activo' => 'boolean',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function cargoRelacion()
    {
        return $this->belongsTo(Cargo::class, 'cargo_id');
    }

    public function usuarioDesignador()
    {
        return $this->belongsTo(User::class, 'usuario_designador_id');
    }
}
