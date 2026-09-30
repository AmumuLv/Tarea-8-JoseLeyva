<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TecnicoUsersSeeder extends Seeder
{
    public function run(): void
    {
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
                    'password' => Hash::make('12345678'),
                    'rol_id' => 2,
                    'estado' => 'activo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $userId = DB::getPdo()->lastInsertId();
                $this->command->info("Usuario creado: {$correo} (ID: {$userId})");
            } else {
                $userId = $existingUser->id;
                $this->command->info("Usuario ya existe: {$correo} (ID: {$userId})");
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
                $this->command->info("Técnico creado: {$codigo} - {$alias}");
            } elseif ($tecnico && !$tecnico->user_id) {
                DB::table('tecnicos')->where('id', $tecnico->id)->update(['user_id' => $userId]);
                $this->command->info("Técnico {$alias} vinculado al usuario");
            }
        }

        $this->command->info('Listo!');
    }
}
