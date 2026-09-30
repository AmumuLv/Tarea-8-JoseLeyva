<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JefeHistorial extends Model
{
    use HasFactory;

    protected $table = 'jefe_historial';

    protected $fillable = [
        'user_id',
        'jefe_nombre',
        'jefe_apellido',
        'jefe_cargo',
        'jefe_documento',
        'jefe_email',
        'jefe_telefono',
        'jefe_foto',
        'fecha_inicio',
        'fecha_fin',
        'cambiado_por',
        'motivo',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'cambiado_por');
    }
}
