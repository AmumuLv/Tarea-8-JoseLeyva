<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function permisos()
    {
        return $this->belongsToMany(Permiso::class, 'rol_permisos', 'rol_id', 'permiso_id');
    }

    public function usuarios()
    {
        return $this->hasMany(User::class);
    }
}
