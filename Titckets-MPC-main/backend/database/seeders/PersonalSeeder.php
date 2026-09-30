<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Area;
use App\Models\Cargo;
use App\Models\AreaUsuario;
use App\Models\Role;

class PersonalSeeder extends Seeder
{
    public function run(): void
    {
        $personalRole = Role::where('nombre', 'Personal')->first();
        if (!$personalRole) {
            $this->command->error('Rol "Personal" no encontrado. Ejecuta RoleSeeder primero.');
            return;
        }

        $cargos = Cargo::whereIn('nombre', ['Alcalde', 'Procuradora', 'Gerente', 'Subgerente', 'Jefe de Oficina', 'Área Institucional'])->get()->keyBy('nombre');

        $personalData = [
            // DNI => [nombres, apellidos, telefono, designaciones[]]
            // Designacion: [area_nombre, cargo_nombre, fecha_inicio, tipo_designacion]
            
            '43323464' => [
                'nombres' => 'Manuel Enrique',
                'apellidos' => 'Murriel Montes',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Control Institucional', 'cargo' => 'Jefe de Oficina', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                    ['area' => 'Gerencia Municipal', 'cargo' => 'Jefe de Oficina', 'fecha' => '2024-03-07', 'tipo' => 'Titular'],
                ]
            ],
            '44775860' => [
                'nombres' => 'Juan Manuel',
                'apellidos' => 'Sanchez Huertas',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Programación Multianual de Inversiones', 'cargo' => 'Jefe de Oficina', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '08653985' => [
                'nombres' => 'Cesar Leonardo',
                'apellidos' => 'Perez Mejia',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Gerencia de Administración Tributaria', 'cargo' => 'Gerente', 'fecha' => '2019-01-02', 'tipo' => 'Titular'],
                    ['area' => 'Gerencia de Administración Tributaria', 'cargo' => 'Gerente', 'fecha' => '2023-04-01', 'tipo' => 'Titular'],
                ]
            ],
            '32130801' => [
                'nombres' => 'Luis Alberto',
                'apellidos' => 'Murriel Santolalla',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Ejecución Coactiva', 'cargo' => 'Subgerente', 'fecha' => '2001-09-10', 'tipo' => 'Titular'],
                ]
            ],
            '32131474' => [
                'nombres' => 'Jose Carlo',
                'apellidos' => 'Cespedes Quiñones',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Gestión del Riesgo de Desastres', 'cargo' => 'Subgerente', 'fecha' => '2019-01-21', 'tipo' => 'Titular'],
                ]
            ],
            '32100339' => [
                'nombres' => 'Efraín Fernando',
                'apellidos' => 'Lockuan Lavado',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Registro Civil y Separación Convencional', 'cargo' => 'Subgerente', 'fecha' => '2022-12-21', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Registro Civil y Separación Convencional', 'cargo' => 'Subgerente', 'fecha' => '2021-02-25', 'tipo' => 'Titular'],
                ]
            ],
            '32101952' => [
                'nombres' => 'Javier Nicanor',
                'apellidos' => 'Cabello Polo',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Desarrollo Territorial', 'cargo' => 'Subgerente', 'fecha' => '2026-02-25', 'tipo' => 'Titular'],
                ]
            ],
            '70899198' => [
                'nombres' => 'Pedro Deyvis',
                'apellidos' => 'Lopez Velasquez',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Contabilidad', 'cargo' => 'Jefe de Oficina', 'fecha' => '2026-06-01', 'tipo' => 'Titular'],
                ]
            ],
            '18147332' => [
                'nombres' => 'Tania Marcela',
                'apellidos' => 'Torres Saenz',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina General de Asesoría Jurídica', 'cargo' => 'Jefe de Oficina', 'fecha' => '2026-03-23', 'tipo' => 'Titular'],
                ]
            ],
            '32110351' => [
                'nombres' => 'César Adolfo',
                'apellidos' => 'Villafranca Chávez',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Fiscalización y Policía Municipal', 'cargo' => 'Subgerente', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '44027447' => [
                'nombres' => 'Wilfredo Nain',
                'apellidos' => 'Silva Mallqui',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Desarrollo Industrial Agropecuario y Pesquero', 'cargo' => 'Subgerente', 'fecha' => '2026-02-23', 'tipo' => 'Titular'],
                ]
            ],
            '07480940' => [
                'nombres' => 'Richer Fredy',
                'apellidos' => 'Norabuena Jacome',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Abastecimiento y Gestión Patrimonial', 'cargo' => 'Jefe de Oficina', 'fecha' => '2026-01-14', 'tipo' => 'Titular'],
                ]
            ],
            '32105076' => [
                'nombres' => 'Neldvin',
                'apellidos' => 'Salinas Cano',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Transporte y Seguridad Vial', 'cargo' => 'Subgerente', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '43590989' => [
                'nombres' => 'Alexis Ricardo',
                'apellidos' => 'Escobar Gil',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Fiscalización Ambiental y ATM', 'cargo' => 'Subgerente', 'fecha' => '2026-02-01', 'tipo' => 'Titular'],
                ]
            ],
            '08783482' => [
                'nombres' => 'Maria Jackeline',
                'apellidos' => 'Cabrera La Rosa',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Programas Sociales', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Servicios Sociales', 'cargo' => 'Subgerente', 'fecha' => '2026-01-07', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Participación Vecinal, Educación y Deportes', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Servicios Sociales', 'cargo' => 'Subgerente', 'fecha' => '2009-10-10', 'tipo' => 'Titular'],
                ]
            ],
            '46223837' => [
                'nombres' => 'Yholvi Cristian',
                'apellidos' => 'Alejo Minaya',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Desarrollo Turístico y Cultural', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Desarrollo Industrial Agropecuario y Pesquero', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Comercio, Licencias y Control Sanitario', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                ]
            ],
            '71820346' => [
                'nombres' => 'Martin Alejandro',
                'apellidos' => 'Colichon Calderon',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Transporte y Seguridad Vial', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Servicios Municipales', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Seguridad Ciudadana', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Gestión Ambiental', 'cargo' => 'Subgerente', 'fecha' => '2026-01-01', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Transporte y Seguridad Vial', 'cargo' => 'Subgerente', 'fecha' => '2024-09-05', 'tipo' => 'Encargado'],
                    ['area' => 'Gerencia de Servicios Municipales y Gestión Ambiental', 'cargo' => 'Gerente', 'fecha' => '2023-04-03', 'tipo' => 'Encargado'],
                ]
            ],
            '70920870' => [
                'nombres' => 'Niki D\'Angelo',
                'apellidos' => 'Higueras Konfu',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Control Institucional', 'cargo' => 'Jefe de Oficina', 'fecha' => '2025-09-26', 'tipo' => 'Titular'],
                ]
            ],
            '46715848' => [
                'nombres' => 'Hans Edgardo',
                'apellidos' => 'Ramos Chamorro',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Infraestructura', 'cargo' => 'Subgerente', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Infraestructura', 'cargo' => 'Subgerente', 'fecha' => '2024-01-08', 'tipo' => 'Titular'],
                ]
            ],
            '16745937' => [
                'nombres' => 'Octavio',
                'apellidos' => 'Verona Sánchez',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Tesorería', 'cargo' => 'Jefe de Oficina', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '04743097' => [
                'nombres' => 'Víctor',
                'apellidos' => 'Alayo Chicalla',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Fiscalización Ambiental y ATM', 'cargo' => 'Subgerente', 'fecha' => '2025-07-22', 'tipo' => 'Titular'],
                ]
            ],
            '43720055' => [
                'nombres' => 'Timoteo Macario',
                'apellidos' => 'Sata Maria Gabino',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Presupuesto', 'cargo' => 'Jefe de Oficina', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '44262641' => [
                'nombres' => 'Grober Wilfredo',
                'apellidos' => 'Chavez Baylon',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Abastecimiento y Gestión Patrimonial', 'cargo' => 'Área Institucional', 'fecha' => '2025-05-15', 'tipo' => 'Titular'],
                    ['area' => 'Oficina de Tecnologías de Información y Comunicaciones', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '40996382' => [
                'nombres' => 'Gilmer Ronald',
                'apellidos' => 'Castillo Chavez',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Infraestructura', 'cargo' => 'Área Institucional', 'fecha' => '2025-05-12', 'tipo' => 'Titular'],
                    ['area' => 'Gerencia de Desarrollo Territorial e Infraestructura', 'cargo' => 'Área Institucional', 'fecha' => '2024-01-08', 'tipo' => 'Titular'],
                ]
            ],
            '70353563' => [
                'nombres' => 'Yoice Marrelly',
                'apellidos' => 'Roque Huiza',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Contabilidad', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-14', 'tipo' => 'Titular'],
                ]
            ],
            '80253161' => [
                'nombres' => 'Jose Ricardo',
                'apellidos' => 'Llanos Colonia',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Servicios Municipales', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-12', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Servicios Municipales', 'cargo' => 'Área Institucional', 'fecha' => '2024-01-04', 'tipo' => 'Titular'],
                    ['area' => 'Oficina de Servicios Generales y Equipo Mecánico', 'cargo' => 'Área Institucional', 'fecha' => '2024-01-04', 'tipo' => 'Titular'],
                ]
            ],
            '42168243' => [
                'nombres' => 'Charly James',
                'apellidos' => 'Hernandez Malpica',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Planeamiento y Modernización', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-16', 'tipo' => 'Titular'],
                ]
            ],
            '41242454' => [
                'nombres' => 'Alan Tino',
                'apellidos' => 'Honores Vasquez',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Desarrollo Turístico y Cultural', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '42445089' => [
                'nombres' => 'Isaac Luis',
                'apellidos' => 'Blaz Ortiz',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Rentas', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-11', 'tipo' => 'Titular'],
                ]
            ],
            '48316946' => [
                'nombres' => 'Katherine Edith',
                'apellidos' => 'Chancafe Canchis',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Desarrollo Territorial', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-11', 'tipo' => 'Titular'],
                ]
            ],
            '43794859' => [
                'nombres' => 'Lyang Rosmery',
                'apellidos' => 'Miranda Falcón',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Transporte y Seguridad Vial', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-11', 'tipo' => 'Titular'],
                ]
            ],
            '45494427' => [
                'nombres' => 'Milagros Teresa',
                'apellidos' => 'Alegre Quito',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Programas Sociales', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '24699052' => [
                'nombres' => 'Gregory Armando',
                'apellidos' => 'Lopez Solis',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Seguridad Ciudadana', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '72691555' => [
                'nombres' => 'Joselin Lloysi',
                'apellidos' => 'Léon Paredes',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Fiscalización Ambiental y ATM', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-11', 'tipo' => 'Titular'],
                ]
            ],
            '70354264' => [
                'nombres' => 'Rhoydi Luvick',
                'apellidos' => 'Quiroz Santos',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Gestión Ambiental', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-11', 'tipo' => 'Titular'],
                ]
            ],
            '44089836' => [
                'nombres' => 'Jose Frank',
                'apellidos' => 'Gonzales Garcia',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Fiscalización y Policía Municipal', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-11', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Fiscalización y Policía Municipal', 'cargo' => 'Área Institucional', 'fecha' => '2018-01-05', 'tipo' => 'Titular'],
                ]
            ],
            '43482800' => [
                'nombres' => 'Susan Evelyn',
                'apellidos' => 'Montero Nuñez',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Participación Vecinal, Educación y Deportes', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                    ['area' => 'Subgerencia de Participación Vecinal, Educación y Deportes', 'cargo' => 'Área Institucional', 'fecha' => '2019-04-01', 'tipo' => 'Titular'],
                ]
            ],
            '45787353' => [
                'nombres' => 'Rommel Enrique',
                'apellidos' => 'Flores Vega',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Desarrollo Industrial Agropecuario y Pesquero', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-11', 'tipo' => 'Titular'],
                ]
            ],
            '73634385' => [
                'nombres' => 'Diego Rafael',
                'apellidos' => 'Santolalla Arias',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Comercio, Licencias y Control Sanitario', 'cargo' => 'Área Institucional', 'fecha' => '2025-03-11', 'tipo' => 'Titular'],
                ]
            ],
            '41599684' => [
                'nombres' => 'Paul Dagoberto',
                'apellidos' => 'Montero Quispe',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Servicios Sociales', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '41212315' => [
                'nombres' => 'Karen Janeth',
                'apellidos' => 'Lavado Vera',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia Local de Empadronamiento', 'cargo' => 'Área Institucional', 'fecha' => '2024-10-03', 'tipo' => 'Titular'],
                ]
            ],
            '41637460' => [
                'nombres' => 'Jorge',
                'apellidos' => 'Minchola Ortiz',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina General de Asesoría Jurídica', 'cargo' => 'Área Institucional', 'fecha' => '2024-07-05', 'tipo' => 'Titular'],
                ]
            ],
            '45598760' => [
                'nombres' => 'Alberto Jaime',
                'apellidos' => 'Tinoco Usua',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Subgerencia de Estudios y Proyectos', 'cargo' => 'Área Institucional', 'fecha' => '2026-02-19', 'tipo' => 'Titular'],
                ]
            ],
            '40355759' => [
                'nombres' => 'Miguel Angel',
                'apellidos' => 'Milla Cruz',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina General de Administración', 'cargo' => 'Área Institucional', 'fecha' => '2024-08-16', 'tipo' => 'Titular'],
                ]
            ],
            '32960944' => [
                'nombres' => 'Cecilia Veronica',
                'apellidos' => 'Wilson Llerena',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Procuraduría Pública Municipal', 'cargo' => 'Procuradora', 'fecha' => '2020-01-02', 'tipo' => 'Titular'],
                ]
            ],
            '17844952' => [
                'nombres' => 'Enrique Alfonso',
                'apellidos' => 'Abanto Diaz',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Archivo General', 'cargo' => 'Área Institucional', 'fecha' => '2011-08-17', 'tipo' => 'Titular'],
                ]
            ],
            '43355091' => [
                'nombres' => 'Melissa Cristina',
                'apellidos' => 'Guzmán Garro',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Relaciones Públicas e Imagen Institucional', 'cargo' => 'Área Institucional', 'fecha' => '2023-04-01', 'tipo' => 'Titular'],
                    ['area' => 'Oficina General de Atención al Ciudadano y Gestión Documentaria', 'cargo' => 'Área Institucional', 'fecha' => '2023-03-01', 'tipo' => 'Titular'],
                ]
            ],
            '32109596' => [
                'nombres' => 'Julio Cesar',
                'apellidos' => 'Melendez Lazaro',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Alcaldía', 'cargo' => 'Alcalde', 'fecha' => '2023-01-03', 'tipo' => 'Titular'],
                ]
            ],
            '42862472' => [
                'nombres' => 'Junior Maycol',
                'apellidos' => 'Acosta Salgado',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Abastecimiento y Gestión Patrimonial', 'cargo' => 'Área Institucional', 'fecha' => '2023-04-01', 'tipo' => 'Titular'],
                ]
            ],
            '40804277' => [
                'nombres' => 'Carlos Jose',
                'apellidos' => 'Peje Quesada',
                'telefono' => '',
                'designaciones' => [
                    ['area' => 'Oficina de Control Institucional', 'cargo' => 'Área Institucional', 'fecha' => '2023-04-01', 'tipo' => 'Titular'],
                ]
            ],
        ];

        $createdUsers = 0;
        $createdDesignaciones = 0;

        foreach ($personalData as $dni => $data) {
            $user = User::where('dni', $dni)->where('rol_id', $personalRole->id)->first();

            if (!$user) {
                $user = User::create([
                    'nombres' => $data['nombres'],
                    'apellidos' => $data['apellidos'],
                    'name' => trim($data['nombres'] . ' ' . $data['apellidos']),
                    'dni' => $dni,
                    'telefono' => $data['telefono'],
                    'rol_id' => $personalRole->id,
                    'estado' => 'activo',
                    'actualmente_laborando' => true,
                    'fecha_ingreso' => collect($data['designaciones'])->min('fecha'),
                    'password' => null,
                    'email' => null,
                ]);
                $createdUsers++;
            }

            // Group designaciones by area, keep only the latest per area
            $latestByArea = collect($data['designaciones'])
                ->groupBy('area')
                ->map(function ($group) {
                    return $group->sortByDesc('fecha')->first();
                });

            foreach ($latestByArea as $desig) {
                $area = Area::where('nombre', $desig['area'])->first();
                $cargo = $cargos->get($desig['cargo']);

                if (!$area) {
                    $this->command->warn("Area no encontrada: {$desig['area']} para DNI {$dni}");
                    continue;
                }

                if (!$cargo) {
                    $this->command->warn("Cargo no encontrado: {$desig['cargo']} para DNI {$dni}");
                    continue;
                }

                $exists = AreaUsuario::where('usuario_id', $user->id)
                    ->where('area_id', $area->id)
                    ->exists();

                if (!$exists) {
                    AreaUsuario::create([
                        'area_id' => $area->id,
                        'usuario_id' => $user->id,
                        'cargo_id' => $cargo->id,
                        'cargo' => $cargo->nombre,
                        'tipo_designacion' => $desig['tipo'],
                        'usuario_designador_id' => 1,
                        'fecha_asignacion' => $desig['fecha'],
                        'fecha_inicio' => $desig['fecha'],
                        'activo' => true,
                        'estado_asignacion' => 'activo',
                    ]);
                    $createdDesignaciones++;
                }
            }
        }

        $this->command->info("Personal creado: {$createdUsers} usuarios, {$createdDesignaciones} designaciones.");
    }
}