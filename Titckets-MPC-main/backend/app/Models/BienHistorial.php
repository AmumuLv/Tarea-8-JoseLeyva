<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BienHistorial extends Model
{
    use HasFactory;

    protected $table = 'bien_historial';

    protected $fillable = [
        'bien_id',
        'tipo_evento',
        'descripcion',
        'usuario_id',
        'fecha',
    ];

    public function bien()
    {
        return $this->belongsTo(Bien::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }
}
