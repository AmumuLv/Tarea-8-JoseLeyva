<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketRespuesta extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'usuario_id',
        'respuesta',
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
