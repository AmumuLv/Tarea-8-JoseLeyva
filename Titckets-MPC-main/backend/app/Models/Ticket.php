<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'titulo',
        'descripcion',
        'categoria',
        'prioridad',
        'estado',
        'area_id',
        'creado_por',
        'asignado_a',
        'fecha_limite',
        'sla_estado',
        'tiempo_estimado_minutos',
        'impacto',
        'urgencia',
        'usuarios_afectados',
        'calificacion',
        'calificacion_comentario',
    ];

    protected $casts = [
        'fecha_limite' => 'datetime',
        'usuarios_afectados' => 'integer',
        'tiempo_estimado_minutos' => 'integer',
        'calificacion' => 'integer',
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'asignado_a');
    }

    public function historial()
    {
        return $this->hasMany(TicketHistorial::class);
    }

    public function respuestas()
    {
        return $this->hasMany(TicketRespuesta::class);
    }

    public function evidencias()
    {
        return $this->hasMany(TicketEvidencia::class);
    }

    public function getElapsedAttribute()
    {
        $created = $this->created_at;
        $now = now();
        $diff = $created->diff($now);
        if ($diff->days > 0) return "{$diff->d}d {$diff->h}h";
        if ($diff->h > 0) return "{$diff->h}h {$diff->i}m";
        return "{$diff->i}m";
    }

    public function getSlaProgressAttribute()
    {
        if (!$this->fecha_limite) return null;
        $total = $this->created_at->diffInSeconds($this->fecha_limite);
        $elapsed = $this->created_at->diffInSeconds(now());
        if ($total <= 0) return 100;
        return min(100, round(($elapsed / $total) * 100));
    }

    public function getRemainingTimeAttribute()
    {
        if (!$this->fecha_limite) return null;
        $remaining = now()->diffInSeconds($this->fecha_limite, false);
        if ($remaining < 0) return 'Vencido';
        $hours = floor($remaining / 3600);
        $minutes = floor(($remaining % 3600) / 60);
        if ($hours > 24) return floor($hours / 24) . 'd ' . ($hours % 24) . 'h';
        if ($hours > 0) return "{$hours}h {$minutes}m";
        return "{$minutes}m";
    }
}
