<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermisoSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $permisos = [
            // Modulo: Usuarios
            ['nombre' => 'crear_usuario',    'modulo' => 'usuarios', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_usuario',   'modulo' => 'usuarios', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_usuario', 'modulo' => 'usuarios', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'ver_usuarios',     'modulo' => 'usuarios', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Areas
            ['nombre' => 'crear_area',    'modulo' => 'areas', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_area',   'modulo' => 'areas', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_area', 'modulo' => 'areas', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'ver_areas',     'modulo' => 'areas', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Sedes
            ['nombre' => 'ver_sedes',     'modulo' => 'sedes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'crear_sede',    'modulo' => 'sedes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_sede',   'modulo' => 'sedes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_sede', 'modulo' => 'sedes', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Tickets
            ['nombre' => 'ver_todos_los_tickets', 'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'ver_tickets_asignados', 'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'ver_mis_tickets',       'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'crear_ticket',          'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_ticket',         'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'cambiar_estado',        'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'cambiar_prioridad',     'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'asignar_tecnico',       'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'reasignar_ticket',      'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'subir_evidencia',       'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_evidencia',    'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'ver_ticket_pdf',        'modulo' => 'tickets', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Historial
            ['nombre' => 'ver_historial', 'modulo' => 'historial', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Respuestas
            ['nombre' => 'agregar_respuesta', 'modulo' => 'respuestas', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Tecnicos
            ['nombre' => 'ver_tecnicos',     'modulo' => 'tecnicos', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'crear_tecnico',    'modulo' => 'tecnicos', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_tecnico',   'modulo' => 'tecnicos', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_tecnico', 'modulo' => 'tecnicos', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Cargos
            ['nombre' => 'ver_cargos',     'modulo' => 'cargos', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'crear_cargo',    'modulo' => 'cargos', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_cargo',   'modulo' => 'cargos', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_cargo', 'modulo' => 'cargos', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Designaciones
            ['nombre' => 'ver_designaciones',     'modulo' => 'designaciones', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'crear_designacion',    'modulo' => 'designaciones', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_designacion',   'modulo' => 'designaciones', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_designacion', 'modulo' => 'designaciones', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Bienes
            ['nombre' => 'ver_bienes',     'modulo' => 'bienes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'crear_bien',     'modulo' => 'bienes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_bien',    'modulo' => 'bienes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_bien',  'modulo' => 'bienes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'gestionar_bienes', 'modulo' => 'bienes', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Tipos de bienes
            ['nombre' => 'ver_tipos_bienes',  'modulo' => 'tipos_bienes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'crear_tipo_bien',   'modulo' => 'tipos_bienes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_tipo_bien',  'modulo' => 'tipos_bienes', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'eliminar_tipo_bien','modulo' => 'tipos_bienes', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Dashboard
            ['nombre' => 'ver_estadisticas', 'modulo' => 'dashboard', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Auditoria
            ['nombre' => 'ver_auditoria', 'modulo' => 'auditoria', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Configuracion
            ['nombre' => 'configurar_sistema', 'modulo' => 'configuracion', 'created_at' => $now, 'updated_at' => $now],

            // Modulo: Perfil Area
            ['nombre' => 'ver_perfil_area',       'modulo' => 'perfil_area', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'editar_perfil_area',    'modulo' => 'perfil_area', 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'cambiar_password_area', 'modulo' => 'perfil_area', 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('permisos')->insertOrIgnore($permisos);
    }
}
