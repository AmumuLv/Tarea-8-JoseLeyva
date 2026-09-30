<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nombres' => 'OTIC',
            'apellidos' => 'Administrador',
            'name' => 'OTIC Administrador',
            'email' => 'otic@municasma.gob.pe',
            'username' => 'otic',
            'password' => Hash::make('OTIC#2026'),
            'dni' => '00000001',
            'cargo' => 'Administrador General',
            'rol_id' => 1,
            'estado' => 'activo',
        ]);
    }
}
