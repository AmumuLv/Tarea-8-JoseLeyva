<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MantenimientoBien extends Model
{
    use HasFactory;

    protected $table = 'mantenimiento_bienes';

    protected $fillable = [
        'bien_id',
        'tecnico_id',
        'fecha',
        'tipo_mantenimiento',
        'descripcion',
        'estado',
    ];

    public function bien()
    {
        return $this->belongsTo(Bien::class);
    }

    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class);
    }
}
