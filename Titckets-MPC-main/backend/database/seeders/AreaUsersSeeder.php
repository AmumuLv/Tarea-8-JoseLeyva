<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\AreaUsuario;
use App\Models\Cargo;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AreaUsersSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('SEED_AREA_PASSWORD');
        if (!$password) {
            throw new RuntimeException(
                'Define SEED_AREA_PASSWORD en backend/.env antes de ejecutar db:seed. No se usan contraseñas por defecto.'
            );
        }

        $rolArea = Role::where('nombre', 'Area Usuaria')->first();
        if (!$rolArea) {
            throw new RuntimeException('No se encontró el rol "Area Usuaria". Ejecuta RoleSeeder primero.');
        }

        $cargoInstitucional = Cargo::where('nombre', 'Área Institucional')->first();
        $areas = Area::all();
        $countUsers = 0;
        $countAreaUsuarios = 0;

        foreach ($areas as $area) {
            // La cuenta institucional solo se crea para áreas que todavía no
            // tienen una designación activa de personal real.
            $existingDesignacion = AreaUsuario::where('area_id', $area->id)
                ->where('estado_asignacion', 'activo')
                ->first();

            if ($existingDesignacion) {
                $nombre = trim(($existingDesignacion->usuario?->nombres ?? '') . ' ' . ($existingDesignacion->usuario?->apellidos ?? ''));
                $this->command?->info("Saltando {$area->nombre}: ya tiene designación activa" . ($nombre ? " ({$nombre})" : ''));
                continue;
            }

            $email = $area->correo;
            if (!$email) {
                $this->command?->warn("Área sin correo institucional: {$area->nombre}");
                continue;
            }

            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'nombres' => $area->nombre,
                    'apellidos' => '',
                    'name' => $area->nombre,
                    'email' => $email,
                    'username' => $email,
                    'password' => Hash::make($password),
                    'dni' => '9' . str_pad($area->id, 7, '0', STR_PAD_LEFT),
                    'cargo' => 'Área Institucional',
                    'rol_id' => $rolArea->id,
                    'estado' => 'activo',
                ]);
                $countUsers++;
            }

            $areaUsuario = AreaUsuario::where('area_id', $area->id)
                ->where('usuario_id', $user->id)
                ->first();

            if (!$areaUsuario) {
                AreaUsuario::create([
                    'area_id' => $area->id,
                    'usuario_id' => $user->id,
                    'cargo' => 'Área Institucional',
                    'cargo_id' => $cargoInstitucional?->id,
                    'tipo_designacion' => 'titular',
                    'activo' => true,
                    'fecha_inicio' => now(),
                    'estado_asignacion' => 'activo',
                ]);
                $countAreaUsuarios++;
            }
        }

        $this->command?->info("Se crearon {$countUsers} usuarios institucionales.");
        $this->command?->info("Se crearon {$countAreaUsuarios} asignaciones area-usuario.");
    }
}
