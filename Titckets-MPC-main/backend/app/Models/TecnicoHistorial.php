<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TecnicoHistorial extends Model
{
    use HasFactory;

    protected $table = 'tecnico_historial';

    protected $fillable = [
        'tecnico_id',
        'accion',
        'descripcion',
        'ticket_id',
        'modelo',
        'modelo_id',
        'ip_address',
        'user_agent',
    ];

    public function tecnico()
    {
        return $this->belongsTo(Tecnico::class);
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public static function registrar(Tecnico $tecnico, string $accion, ?string $descripcion = null, ?int $ticketId = null, ?string $modelo = null, ?int $modeloId = null, ?string $ip = null, ?string $ua = null): self
    {
        return static::create([
            'tecnico_id' => $tecnico->id,
            'accion' => $accion,
            'descripcion' => $descripcion,
            'ticket_id' => $ticketId,
            'modelo' => $modelo,
            'modelo_id' => $modeloId,
            'ip_address' => $ip,
            'user_agent' => $ua,
        ]);
    }
}
