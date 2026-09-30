<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneralAudit extends Model
{
    use HasFactory;

    protected $table = 'general_audit';

    protected $fillable = [
        'user_id',
        'rol',
        'area',
        'accion',
        'modelo',
        'modelo_id',
        'descripcion',
        'ip_address',
        'user_agent',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
