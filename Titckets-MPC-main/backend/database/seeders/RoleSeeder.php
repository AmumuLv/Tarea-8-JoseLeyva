<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['nombre' => 'Administrador', 'descripcion' => 'Acceso total al sistema. Puede gestionar usuarios, áreas, tickets y configuraciones.'],
            ['nombre' => 'Tecnico', 'descripcion' => 'Gestiona tickets asignados, cambia estados y agrega respuestas.'],
            ['nombre' => 'Area Usuaria', 'descripcion' => 'Crea tickets, agrega respuestas y consulta el historial de sus solicitudes.'],
            ['nombre' => 'Personal', 'descripcion' => 'Personal municipal sin acceso al sistema de tickets.'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['nombre' => $role['nombre']],
                [
                    'descripcion' => $role['descripcion'],
                    'updated_at' => now(),
                    'created_at' => DB::raw('COALESCE(created_at, CURRENT_TIMESTAMP)'),
                ]
            );
        }
    }
}
