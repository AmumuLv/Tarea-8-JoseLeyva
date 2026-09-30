<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolPermisoSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $permisos = DB::table('permisos')->pluck('id', 'nombre');

        $rolPermisos = [];

        // Administrador: permisos de configuracion y gestion global
        $adminPermisos = [
            // Gestion global
            'configurar_sistema', 'ver_auditoria', 'ver_estadisticas',
            // Usuarios
            'crear_usuario', 'editar_usuario', 'eliminar_usuario', 'ver_usuarios',
            // Areas
            'crear_area', 'editar_area', 'eliminar_area', 'ver_areas',
            // Sedes
            'ver_sedes', 'crear_sede', 'editar_sede', 'eliminar_sede',
            // Tecnicos
            'ver_tecnicos', 'crear_tecnico', 'editar_tecnico', 'eliminar_tecnico',
            // Cargos
            'ver_cargos', 'crear_cargo', 'editar_cargo', 'eliminar_cargo',
            // Designaciones
            'ver_designaciones', 'crear_designacion', 'editar_designacion', 'eliminar_designacion',
            // Tickets (todos)
            'ver_todos_los_tickets', 'crear_ticket', 'editar_ticket', 'cambiar_estado',
            'cambiar_prioridad', 'asignar_tecnico', 'reasignar_ticket',
            'subir_evidencia', 'eliminar_evidencia', 'ver_ticket_pdf',
            'agregar_respuesta', 'ver_historial',
            // Bienes
            'ver_bienes', 'crear_bien', 'editar_bien', 'eliminar_bien', 'gestionar_bienes',
            'ver_tipos_bienes', 'crear_tipo_bien', 'editar_tipo_bien', 'eliminar_tipo_bien',
        ];
        foreach ($adminPermisos as $nombre) {
            if (isset($permisos[$nombre])) {
                $rolPermisos[] = ['rol_id' => 1, 'permiso_id' => $permisos[$nombre]];
            }
        }

        // Soporte OTIC (Tecnico): tickets asignados, soporte
        $tecnicoPermisos = [
            'ver_tickets_asignados',
            'editar_ticket',
            'cambiar_estado',
            'cambiar_prioridad',
            'agregar_respuesta',
            'subir_evidencia',
            'eliminar_evidencia',
            'ver_ticket_pdf',
            'ver_historial',
            'ver_bienes',
            'editar_bien',
            'gestionar_bienes',
            'ver_tecnicos',
            'ver_estadisticas',
        ];
        foreach ($tecnicoPermisos as $nombre) {
            if (isset($permisos[$nombre])) {
                $rolPermisos[] = ['rol_id' => 2, 'permiso_id' => $permisos[$nombre]];
            }
        }

        // Area Usuaria: crea tickets, ve sus bienes
        $areaUsuarioPermisos = [
            'ver_mis_tickets',
            'crear_ticket',
            'editar_ticket',
            'agregar_respuesta',
            'subir_evidencia',
            'ver_ticket_pdf',
            'ver_historial',
            'ver_bienes',
            'ver_perfil_area',
            'editar_perfil_area',
            'cambiar_password_area',
            'ver_estadisticas',
        ];
        foreach ($areaUsuarioPermisos as $nombre) {
            if (isset($permisos[$nombre])) {
                $rolPermisos[] = ['rol_id' => 3, 'permiso_id' => $permisos[$nombre]];
            }
        }

        // Personal: sin permisos de sistema (solo registro de datos)
        $personalPermisos = [];
        foreach ($personalPermisos as $nombre) {
            if (isset($permisos[$nombre])) {
                $rolPermisos[] = ['rol_id' => 4, 'permiso_id' => $permisos[$nombre]];
            }
        }

        DB::table('rol_permisos')->insert($rolPermisos);
    }
}
