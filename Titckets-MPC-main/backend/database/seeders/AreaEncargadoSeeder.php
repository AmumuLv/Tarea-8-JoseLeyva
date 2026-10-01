<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\AreaUsuario;
use App\Models\Cargo;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AreaEncargadoSeeder extends Seeder
{
    public function run(): void
    {
        $cargoInstitucional = Cargo::where('nombre', 'Área Institucional')->first();
        $personalRole = Role::where('nombre', 'Personal')->first();
        $adminRole = Role::where('nombre', 'Administrador')->first();
        $adminUser = $adminRole ? User::where('rol_id', $adminRole->id)->orderBy('id')->first() : null;

        if (!$cargoInstitucional) {
            throw new RuntimeException('No se encontró el cargo Área Institucional. Ejecuta CargoSeeder primero.');
        }
        if (!$personalRole) {
            throw new RuntimeException('No se encontró el rol Personal. Ejecuta RoleSeeder primero.');
        }

        // Áreas que solo tienen cuenta institucional: asignar personal real como encargado.
        $asignaciones = [
            'Comisiones de Regidores' => ['dni' => '43323464', 'cargo' => 'Jefe de Oficina'],
            'Comité de Administración del Programa Vaso de Leche' => ['dni' => '17844952', 'cargo' => 'Jefe de Oficina'],
            'Comité Provincial de Seguridad Ciudadana (COPROSEC)' => ['dni' => '40804277', 'cargo' => 'Jefe de Oficina'],
            'Oficina de Archivo General' => ['dni' => '17844952', 'cargo' => 'Jefe de Oficina'],
            'Oficina de Planeamiento y Modernización' => ['dni' => '42168243', 'cargo' => 'Jefe de Oficina'],
            'Oficina de Recursos Humanos' => ['dni' => '43355091', 'cargo' => 'Jefe de Oficina'],
            'Oficina de Servicios Generales y Equipo Mecánico' => ['dni' => '80253161', 'cargo' => 'Jefe de Oficina'],
            'Oficina de Tecnologías de Información y Comunicaciones' => ['dni' => '44262641', 'cargo' => 'Jefe de Oficina'],
            'Oficina de Trámite Documentario' => ['dni' => '41637460', 'cargo' => 'Jefe de Oficina'],
            'Oficina General de Administración' => ['dni' => '40355759', 'cargo' => 'Jefe de Oficina'],
            'Oficina General de Atención al Ciudadano y Gestión Documentaria' => ['dni' => '43355091', 'cargo' => 'Jefe de Oficina'],
            'Oficina de Relaciones Públicas e Imagen Institucional' => ['dni' => '43355091', 'cargo' => 'Jefe de Oficina'],
            'Oficina General de Planeamiento y Presupuesto' => ['dni' => '42168243', 'cargo' => 'Jefe de Oficina'],
            'Subgerencia de Estudios y Proyectos' => ['dni' => '45598760', 'cargo' => 'Subgerente'],
            'Subgerencia de Rentas' => ['dni' => '42445089', 'cargo' => 'Subgerente'],
            'Subgerencia Local de Empadronamiento' => ['dni' => '41212315', 'cargo' => 'Subgerente'],
            'Gerencia de Desarrollo Económico' => ['dni' => '08653985', 'cargo' => 'Gerente'],
            'Gerencia de Desarrollo Social' => ['dni' => '45598760', 'cargo' => 'Gerente'],
            'Gerencia de Desarrollo Territorial e Infraestructura' => ['dni' => '40996382', 'cargo' => 'Gerente'],
            'Instituto Vial Provincial Municipal de Casma' => ['dni' => '46715848', 'cargo' => 'Subgerente'],
        ];

        $created = 0;

        foreach ($asignaciones as $areaNombre => $config) {
            $area = Area::where('nombre', $areaNombre)->first();
            $user = User::where('dni', $config['dni'])
                ->where('rol_id', $personalRole->id)
                ->first();
            $cargo = Cargo::where('nombre', $config['cargo'])->first();

            if (!$area) {
                $this->command?->warn("Área no encontrada: {$areaNombre}");
                continue;
            }
            if (!$user) {
                $this->command?->warn("Usuario no encontrado: DNI {$config['dni']}");
                continue;
            }
            if (!$cargo) {
                $this->command?->warn("Cargo no encontrado: {$config['cargo']}");
                continue;
            }

            $exists = AreaUsuario::where('area_id', $area->id)
                ->where('usuario_id', $user->id)
                ->where('cargo_id', $cargo->id)
                ->where('estado_asignacion', 'activo')
                ->exists();

            if ($exists) {
                continue;
            }

            AreaUsuario::where('area_id', $area->id)
                ->where('cargo_id', $cargoInstitucional->id)
                ->where('estado_asignacion', 'activo')
                ->update([
                    'estado_asignacion' => 'finalizado',
                    'fecha_fin' => now(),
                    'activo' => false,
                ]);

            AreaUsuario::create([
                'area_id' => $area->id,
                'usuario_id' => $user->id,
                'cargo_id' => $cargo->id,
                'cargo' => $cargo->nombre,
                'tipo_designacion' => 'Encargado',
                'usuario_designador_id' => $adminUser?->id,
                'fecha_asignacion' => now(),
                'fecha_inicio' => now(),
                'activo' => true,
                'estado_asignacion' => 'activo',
            ]);
            $created++;
            $this->command?->info("Asignado: {$areaNombre} => {$user->nombres} {$user->apellidos} como {$cargo->nombre} (Encargado)");
        }

        $areasConPersonalReal = AreaUsuario::where('estado_asignacion', 'activo')
            ->where('cargo_id', '!=', $cargoInstitucional->id)
            ->pluck('area_id')
            ->unique();

        foreach ($areasConPersonalReal as $areaId) {
            AreaUsuario::where('area_id', $areaId)
                ->where('cargo_id', $cargoInstitucional->id)
                ->where('estado_asignacion', 'activo')
                ->update([
                    'estado_asignacion' => 'finalizado',
                    'fecha_fin' => now(),
                    'activo' => false,
                ]);
        }

        $this->command?->info("Encargados creados: {$created}");
        $this->command?->info('Limpieza Área Institucional completada para ' . $areasConPersonalReal->count() . ' áreas.');
    }
}
