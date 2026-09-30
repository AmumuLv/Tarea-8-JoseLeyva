<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketEvidencia extends Model
{
    use HasFactory;

    protected $table = 'ticket_evidencias';

    protected $fillable = [
        'ticket_id',
        'usuario_id',
        'nombre_original',
        'nombre_archivo',
        'ruta',
        'mime_type',
        'tamano',
        'descripcion',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
