<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoBien extends Model
{
    use HasFactory;

    protected $table = 'tipo_bienes';

    protected $fillable = [
        'nombre',
        'icono',
        'estado',
    ];

    public function bienes()
    {
        return $this->hasMany(Bien::class, 'tipo_bien_id');
    }
}
