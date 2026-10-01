<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RolPermisoSeeder extends Seeder
{
    public function run(): void
    {
        $permisos = DB::table('permisos')->pluck('id', 'nombre');
        $roles = DB::table('roles')->pluck('id', 'nombre');

        foreach (['Administrador', 'Tecnico', 'Area Usuaria', 'Personal'] as $roleName) {
            if (!isset($roles[$roleName])) {
                throw new RuntimeException("Falta el rol {$roleName}. Ejecuta RoleSeeder primero.");
            }
        }

        $mapa = [
            'Administrador' => [
                'configurar_sistema', 'ver_auditoria', 'ver_estadisticas',
                'crear_usuario', 'editar_usuario', 'eliminar_usuario', 'ver_usuarios',
                'crear_area', 'editar_area', 'eliminar_area', 'ver_areas',
                'ver_sedes', 'crear_sede', 'editar_sede', 'eliminar_sede',
                'ver_tecnicos', 'crear_tecnico', 'editar_tecnico', 'eliminar_tecnico',
                'ver_cargos', 'crear_cargo', 'editar_cargo', 'eliminar_cargo',
                'ver_designaciones', 'crear_designacion', 'editar_designacion', 'eliminar_designacion',
                'ver_todos_los_tickets', 'crear_ticket', 'editar_ticket', 'cambiar_estado',
                'cambiar_prioridad', 'asignar_tecnico', 'reasignar_ticket',
                'subir_evidencia', 'eliminar_evidencia', 'ver_ticket_pdf',
                'agregar_respuesta', 'ver_historial',
                'ver_bienes', 'crear_bien', 'editar_bien', 'eliminar_bien', 'gestionar_bienes',
                'ver_tipos_bienes', 'crear_tipo_bien', 'editar_tipo_bien', 'eliminar_tipo_bien',
            ],
            'Tecnico' => [
                'ver_tickets_asignados', 'editar_ticket', 'cambiar_estado', 'cambiar_prioridad',
                'agregar_respuesta', 'subir_evidencia', 'eliminar_evidencia', 'ver_ticket_pdf',
                'ver_historial', 'ver_bienes', 'editar_bien', 'gestionar_bienes',
                'ver_tecnicos', 'ver_estadisticas',
            ],
            'Area Usuaria' => [
                'ver_mis_tickets', 'crear_ticket', 'editar_ticket', 'agregar_respuesta',
                'subir_evidencia', 'ver_ticket_pdf', 'ver_historial', 'ver_bienes',
                'ver_perfil_area', 'editar_perfil_area', 'cambiar_password_area', 'ver_estadisticas',
            ],
            'Personal' => [],
        ];

        $rolPermisos = [];
        foreach ($mapa as $roleName => $permissionNames) {
            foreach ($permissionNames as $permissionName) {
                if (!isset($permisos[$permissionName])) {
                    $this->command?->warn("Permiso no encontrado: {$permissionName}");
                    continue;
                }

                $rolPermisos[] = [
                    'rol_id' => $roles[$roleName],
                    'permiso_id' => $permisos[$permissionName],
                ];
            }
        }

        DB::table('rol_permisos')->insertOrIgnore($rolPermisos);
    }
}
