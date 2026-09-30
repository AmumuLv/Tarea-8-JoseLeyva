<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'nombres',
        'apellidos',
        'dni',
        'foto',
        'email',
        'correo_institucional',
        'username',
        'password',
        'cargo',
        'telefono',
        'rol_id',
        'estado',
        'fecha_ingreso',
        'fecha_cese',
        'actualmente_laborando',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'username',
        'name',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'fecha_ingreso' => 'date',
            'fecha_cese' => 'date',
            'actualmente_laborando' => 'boolean',
        ];
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function getFullNameAttribute()
    {
        return trim($this->nombres . ' ' . $this->apellidos);
    }

    public function rol()
    {
        return $this->belongsTo(Role::class);
    }

    public function asignaciones()
    {
        return $this->hasMany(AreaUsuario::class, 'usuario_id');
    }

    public function areaActual()
    {
        return $this->hasOne(AreaUsuario::class, 'usuario_id')->where('activo', true);
    }

    public function area()
    {
        return $this->hasOneThrough(
            Area::class,
            AreaUsuario::class,
            'usuario_id',
            'id',
            'id',
            'area_id'
        )->where('area_usuario.activo', true);
    }

    public function areaInstitucional()
    {
        return $this->hasOne(Area::class, 'correo', 'email');
    }

    public function ticketsCreados()
    {
        return $this->hasMany(Ticket::class, 'creado_por');
    }

    public function ticketsAsignados()
    {
        return $this->hasMany(Ticket::class, 'asignado_a');
    }

    public function historial()
    {
        return $this->hasMany(TicketHistorial::class, 'usuario_id');
    }

    public function respuestas()
    {
        return $this->hasMany(TicketRespuesta::class, 'usuario_id');
    }

    public function userAudits()
    {
        return $this->hasMany(UserAudit::class);
    }

    public function permisos()
    {
        return $this->rol->permisos();
    }
}
