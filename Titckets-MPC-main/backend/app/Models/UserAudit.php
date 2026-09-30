<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAudit extends Model
{
    use HasFactory;

    protected $table = 'user_audit';

    protected $fillable = [
        'user_id',
        'admin_id',
        'accion',
        'campo',
        'valor_anterior',
        'valor_nuevo',
        'descripcion',
        'ip_address',
        'user_agent',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
