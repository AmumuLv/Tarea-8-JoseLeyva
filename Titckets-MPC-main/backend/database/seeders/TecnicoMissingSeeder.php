<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Seeder de reparación manual para instalaciones antiguas que tengan técnicos
 * 2-5 incompletos. No forma parte del DatabaseSeeder normal.
 */
class TecnicoMissingSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('SEED_TECNICO_PASSWORD');
        if (!$password) {
            throw new RuntimeException(
                'Define SEED_TECNICO_PASSWORD en backend/.env antes de ejecutar TecnicoMissingSeeder.'
            );
        }

        $rolTecnico = Role::where('nombre', 'Tecnico')->first();
        if (!$rolTecnico) {
            throw new RuntimeException('No se encontró el rol Tecnico. Ejecuta RoleSeeder primero.');
        }

        $tecnicos = [
            2 => 'Técnico 2',
            3 => 'Técnico 3',
            4 => 'Técnico 4',
            5 => 'Técnico 5',
        ];

        foreach ($tecnicos as $i => $alias) {
            $correo = "tecnico{$i}@municasma.gob.pe";
            $codigo = 'TEC-' . str_pad($i, 4, '0', STR_PAD_LEFT);

            $exists = DB::table('tecnicos')->where('codigo', $codigo)->first();
            if ($exists) {
                $this->command?->info("Ya existe: {$codigo}");
                continue;
            }

            $userId = DB::table('users')->where('email', $correo)->value('id');
            if (!$userId) {
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
            }

            DB::table('tecnicos')->insert([
                'user_id' => $userId,
                'codigo' => $codigo,
                'alias' => $alias,
                'estado' => 'activo',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->command?->info("Técnico creado: {$codigo} - {$alias}");
        }

        $this->command?->info('Total técnicos: ' . DB::table('tecnicos')->count());
    }
}
