<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bien extends Model
{
    use HasFactory;

    protected $table = 'bienes';

    protected $fillable = [
        'codigo',
        'tipo_bien_id',
        'area_id',
        'sede_id',
        'estado',
        'marca',
        'modelo',
        'numero_serie',
        'codigo_patrimonial',
        'ubicacion',
        'observaciones',
    ];

    public function tipoBien()
    {
        return $this->belongsTo(TipoBien::class, 'tipo_bien_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'sede_id');
    }

    public function especificaciones()
    {
        return $this->hasMany(BienEspecificacion::class, 'bien_id');
    }

    public function mantenimientos()
    {
        return $this->hasMany(MantenimientoBien::class, 'bien_id')->orderBy('fecha', 'desc');
    }

    public function historial()
    {
        return $this->hasMany(BienHistorial::class, 'bien_id')->orderBy('created_at', 'desc');
    }

    public function responsable()
    {
        return $this->hasOneThrough(
            User::class,
            AreaUsuario::class,
            'area_id',
            'id',
            'area_id',
            'usuario_id'
        )->where('area_usuario.estado_asignacion', 'activo');
    }
}
