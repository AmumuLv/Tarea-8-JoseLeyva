<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

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
            Role::updateOrCreate(
                ['nombre' => $role['nombre']],
                ['descripcion' => $role['descripcion']]
            );
        }
    }
}
