<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SEED_ADMIN_EMAIL', 'otic@municasma.gob.pe');
        $password = env('SEED_ADMIN_PASSWORD');

        if (!$password) {
            throw new RuntimeException(
                'Define SEED_ADMIN_PASSWORD en backend/.env antes de ejecutar db:seed. No se usan contraseñas por defecto.'
            );
        }

        if (User::where('email', $email)->exists()) {
            $this->command?->info("Administrador ya existente: {$email}. No se modifica su contraseña.");
            return;
        }

        $rol = Role::where('nombre', 'Administrador')->firstOrFail();

        User::create([
            'nombres' => 'OTIC',
            'apellidos' => 'Administrador',
            'name' => 'OTIC Administrador',
            'email' => $email,
            'username' => 'otic',
            'password' => Hash::make($password),
            'dni' => '00000001',
            'cargo' => 'Administrador General',
            'rol_id' => $rol->id,
            'estado' => 'activo',
        ]);

        $this->command?->info("Administrador creado: {$email}");
    }
}
