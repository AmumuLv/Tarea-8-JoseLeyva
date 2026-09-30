<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sede extends Model
{
    use HasFactory;

    protected $table = 'sedes';

    protected $fillable = [
        'nombre',
        'direccion',
        'descripcion',
        'estado',
    ];

    public function bienes()
    {
        return $this->hasMany(Bien::class);
    }
}
