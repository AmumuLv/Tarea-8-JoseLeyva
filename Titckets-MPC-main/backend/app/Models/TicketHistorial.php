<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketHistorial extends Model
{
    use HasFactory;

    protected $table = 'ticket_historial';

    protected $fillable = [
        'ticket_id',
        'usuario_id',
        'tipo_cambio',
        'valor_anterior',
        'valor_nuevo',
        'comentario',
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
