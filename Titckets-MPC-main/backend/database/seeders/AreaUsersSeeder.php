<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Area;
use App\Models\AreaUsuario;
use App\Models\Cargo;

class AreaUsersSeeder extends Seeder
{
    public function run(): void
    {
        $rolArea = \App\Models\Role::where('nombre', 'Area Usuaria')->first();

        if (!$rolArea) {
            $this->command->error('No se encontró el rol "Area Usuaria". Ejecuta RoleSeeder primero.');
            return;
        }

        $cargoInstitucional = Cargo::where('nombre', 'Área Institucional')->first();
        $areas = Area::all();
        $countUsers = 0;
        $countAreaUsuarios = 0;

        foreach ($areas as $area) {
            // Skip if area already has an active designación (from PersonalSeeder)
            $existingDesignacion = AreaUsuario::where('area_id', $area->id)
                ->where('estado_asignacion', 'activo')
                ->first();
            
            if ($existingDesignacion) {
                $this->command->info("Saltando {$area->nombre}: ya tiene designación activa ({$existingDesignacion->usuario->nombres} {$existingDesignacion->usuario->apellidos})");
                continue;
            }

            $email = $area->correo;
            $password = $area->password_correo ?: 'MPC@2026!';

            if (!$email) continue;

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

        $this->command->info("Se crearon {$countUsers} usuarios institucionales.");
        $this->command->info("Se crearon {$countAreaUsuarios} asignaciones area-usuario.");
    }
}
