<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TecnicoMissingSeeder extends Seeder
{
    public function run(): void
    {
        $tecnicos = [
            2 => 'Tecnico 2',
            3 => 'Tecnico 3',
            4 => 'Tecnico 4',
            5 => 'Tecnico 5',
        ];

        foreach ($tecnicos as $i => $alias) {
            $correo = "tecnico{$i}@municasma.gob.pe";
            $codigo = 'TEC-' . str_pad($i, 4, '0', STR_PAD_LEFT);

            $exists = DB::table('tecnicos')->where('codigo', $codigo)->first();
            if ($exists) {
                $this->command->info("Ya existe: {$codigo}");
                continue;
            }

            $userId = DB::table('users')->where('email', $correo)->value('id');
            if (!$userId) {
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
            }

            DB::table('tecnicos')->insert([
                'user_id' => $userId,
                'codigo' => $codigo,
                'alias' => $alias,
                'estado' => 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->command->info("Técnico creado: {$codigo} - {$alias}");
        }

        $this->command->info("Total técnicos: " . DB::table('tecnicos')->count());
    }
}
