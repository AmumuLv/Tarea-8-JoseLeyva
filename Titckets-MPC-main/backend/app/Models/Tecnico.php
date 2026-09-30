<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tecnico extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'codigo',
        'alias',
        'nombres',
        'apellidos',
        'estado',
        'ultimo_acceso',
    ];

    protected $casts = [
        'ultimo_acceso' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Tecnico $tecnico) {
            if (empty($tecnico->codigo)) {
                $tecnico->codigo = self::generarCodigo();
            }
        });
    }

    public static function generarCodigo(): string
    {
        $last = self::orderBy('id', 'desc')->first();
        if ($last && preg_match('/TEC-(\d+)/', $last->codigo, $matches)) {
            $next = (int) $matches[1] + 1;
        } else {
            $next = 1;
        }
        return 'TEC-' . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tickets()
    {
        return $this->hasManyThrough(
            Ticket::class,
            User::class,
            'id',
            'asignado_a',
            'user_id',
            'id'
        );
    }

    public function historial()
    {
        return $this->hasMany(TecnicoHistorial::class);
    }

    public function getTicketsActivosCountAttribute(): int
    {
        return $this->tickets()->whereIn('tickets.estado', ['pendiente', 'asignado', 'en_proceso', 'en_espera'])->count();
    }

    public function getNombreCompletoAttribute(): ?string
    {
        if ($this->nombres && $this->apellidos) {
            return "{$this->nombres} {$this->apellidos}";
        }
        return $this->nombres ?: $this->apellidos ?: null;
    }

    public function getDisponibilidadAttribute(): string
    {
        if ($this->estado === 'inactivo') return 'inactivo';
        if ($this->tickets_activos_count >= 5) return 'ocupado';
        if ($this->tickets_activos_count > 0) return 'atendiendo';
        return 'disponible';
    }
}
