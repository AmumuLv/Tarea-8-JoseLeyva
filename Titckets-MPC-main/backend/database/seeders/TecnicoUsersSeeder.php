<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class TecnicoUsersSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('SEED_TECNICO_PASSWORD');
        if (!$password) {
            throw new RuntimeException(
                'Define SEED_TECNICO_PASSWORD en backend/.env antes de ejecutar db:seed. No se usan contraseñas por defecto.'
            );
        }

        $rolTecnico = Role::where('nombre', 'Tecnico')->first();
        if (!$rolTecnico) {
            throw new RuntimeException('No se encontró el rol Tecnico. Ejecuta RoleSeeder primero.');
        }

        for ($i = 1; $i <= 5; $i++) {
            $correo = "tecnico{$i}@municasma.gob.pe";
            $alias = "Técnico {$i}";
            $codigo = 'TEC-' . str_pad($i, 4, '0', STR_PAD_LEFT);

            $existingUser = DB::table('users')->where('email', $correo)->first();

            if (!$existingUser) {
                DB::table('users')->insert([
                    'nombres' => $alias,
                    'apellidos' => '-',
                    'name' => $alias,
                    'email' => $correo,
                    'username' => $correo,
                    'password' => Hash::make($password),
                    'rol_id' => $rolTecnico->id,
                    'estado' => 'activo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $userId = DB::getPdo()->lastInsertId();
                $this->command?->info("Usuario creado: {$correo} (ID: {$userId})");
            } else {
                $userId = $existingUser->id;
                $this->command?->info("Usuario ya existe: {$correo} (ID: {$userId}). No se modifica su contraseña.");
            }

            $tecnico = DB::table('tecnicos')->where('codigo', $codigo)->first();
            if (!$tecnico) {
                DB::table('tecnicos')->insert([
                    'user_id' => $userId,
                    'codigo' => $codigo,
                    'alias' => $alias,
                    'nombres' => $alias,
                    'apellidos' => '-',
                    'estado' => 'activo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->command?->info("Técnico creado: {$codigo} - {$alias}");
            } elseif (!$tecnico->user_id) {
                DB::table('tecnicos')->where('id', $tecnico->id)->update(['user_id' => $userId]);
                $this->command?->info("Técnico {$alias} vinculado al usuario");
            }
        }

        $this->command?->info('Técnicos base verificados.');
    }
}
