<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;
use App\Models\AreaUsuario;
use App\Models\User;
use App\Models\Cargo;

class AreaEncargadoSeeder extends Seeder
{
    public function run(): void
    {
        $cargoInstitucional = Cargo::where('nombre', 'Área Institucional')->first();
        $cargoJefe = Cargo::where('nombre', 'Jefe de Oficina')->first();
        $cargoSubgerente = Cargo::where('nombre', 'Subgerente')->first();
        $cargoGerente = Cargo::where('nombre', 'Gerente')->first();

        // Areas that only have Área Institucional -> assign real personal as Encargado
        $asignaciones = [
            // Areas that need Jefe de Oficina
            'Comisiones de Regidores' => ['dni' => '43323464', 'cargo' => 'Jefe de Oficina'], // Murriel Montes
            'Comité de Administración del Programa Vaso de Leche' => ['dni' => '17844952', 'cargo' => 'Jefe de Oficina'], // Enrique Alfonso
            'Comité Provincial de Seguridad Ciudadana (COPROSEC)' => ['dni' => '40804277', 'cargo' => 'Jefe de Oficina'], // Carlos Jose
            'Oficina de Archivo General' => ['dni' => '17844952', 'cargo' => 'Jefe de Oficina'], // Enrique Alfonso
            'Oficina de Planeamiento y Modernización' => ['dni' => '42168243', 'cargo' => 'Jefe de Oficina'], // Hernandez
            'Oficina de Recursos Humanos' => ['dni' => '43355091', 'cargo' => 'Jefe de Oficina'], // Melissa
            'Oficina de Servicios Generales y Equipo Mecánico' => ['dni' => '80253161', 'cargo' => 'Jefe de Oficina'], // Jose Ricardo
            'Oficina de Tecnologías de Información y Comunicaciones' => ['dni' => '44262641', 'cargo' => 'Jefe de Oficina'], // Chavez Baylon
            'Oficina de Trámite Documentario' => ['dni' => '41637460', 'cargo' => 'Jefe de Oficina'], // Jorge Minchola
            'Oficina General de Administración' => ['dni' => '40355759', 'cargo' => 'Jefe de Oficina'], // Miguel Angel
            'Oficina General de Atención al Ciudadano y Gestión Documentaria' => ['dni' => '43355091', 'cargo' => 'Jefe de Oficina'], // Melissa
            'Oficina de Relaciones Públicas e Imagen Institucional' => ['dni' => '43355091', 'cargo' => 'Jefe de Oficina'], // Melissa
            'Oficina General de Planeamiento y Presupuesto' => ['dni' => '42168243', 'cargo' => 'Jefe de Oficina'], // Hernandez

            // Areas that need Subgerente
            'Subgerencia de Estudios y Proyectos' => ['dni' => '45598760', 'cargo' => 'Subgerente'], // Alberto Jaime
            'Subgerencia de Rentas' => ['dni' => '42445089', 'cargo' => 'Subgerente'], // Isaac Luis
            'Subgerencia Local de Empadronamiento' => ['dni' => '41212315', 'cargo' => 'Subgerente'], // Lavado Vera

            // Areas that need Gerente
            'Gerencia de Desarrollo Económico' => ['dni' => '08653985', 'cargo' => 'Gerente'], // Perez Mejia
            'Gerencia de Desarrollo Social' => ['dni' => '45598760', 'cargo' => 'Gerente'], // Alberto Jaime
            'Gerencia de Desarrollo Territorial e Infraestructura' => ['dni' => '40996382', 'cargo' => 'Gerente'], // Gilmer Ronald

            // Areas that need specific
            'Instituto Vial Provincial Municipal de Casma' => ['dni' => '46715848', 'cargo' => 'Subgerente'], // Hans Edgardo
        ];

        $created = 0;

        foreach ($asignaciones as $areaNombre => $config) {
            $area = Area::where('nombre', $areaNombre)->first();
            $user = User::where('dni', $config['dni'])->where('rol_id', 4)->first();
            $cargo = Cargo::where('nombre', $config['cargo'])->first();

            if (!$area) {
                $this->command->warn("Area no encontrada: $areaNombre");
                continue;
            }
            if (!$user) {
                $this->command->warn("Usuario no encontrado: DNI {$config['dni']}");
                continue;
            }
            if (!$cargo) {
                $this->command->warn("Cargo no encontrado: {$config['cargo']}");
                continue;
            }

            // Check if already has this person as encargad0
            $exists = AreaUsuario::where('area_id', $area->id)
                ->where('usuario_id', $user->id)
                ->where('cargo_id', $cargo->id)
                ->where('estado_asignacion', 'activo')
                ->exists();

            if (!$exists) {
                // Deactivate any existing "Área Institucional" for this area
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
                    'usuario_designador_id' => 1,
                    'fecha_asignacion' => now(),
                    'fecha_inicio' => now(),
                    'activo' => true,
                    'estado_asignacion' => 'activo',
                ]);
                $created++;
                $this->command->info("Asignado: {$areaNombre} => {$user->nombres} {$user->apellidos} como {$cargo->nombre} (Encargado)");
            }
        }

        $this->command->info("Encargados creados: $created");

        // Cleanup: Deactivate ALL Área Institucional for areas that have ANY real person active
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

        $this->command->info("Limpieza Área Institucional completada para " . $areasConPersonalReal->count() . " areas.");
    }
}