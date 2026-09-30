<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            [
                'id' => 1,
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso total al sistema. Puede gestionar usuarios, áreas, tickets y configuraciones.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'nombre' => 'Tecnico',
                'descripcion' => 'Gestiona tickets asignados, cambia estados y agrega respuestas.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'nombre' => 'Area Usuaria',
                'descripcion' => 'Crea tickets, agrega respuestas y consulta el historial de sus solicitudes.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'nombre' => 'Personal',
                'descripcion' => 'Personal municipal sin acceso al sistema de tickets.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
