<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BienEspecificacion extends Model
{
    use HasFactory;

    protected $table = 'bien_especificaciones';

    protected $fillable = [
        'bien_id',
        'campo',
        'valor',
    ];

    public function bien()
    {
        return $this->belongsTo(Bien::class);
    }
}
