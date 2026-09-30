<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoBienSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Computadora de Escritorio', 'icono' => 'Monitor', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Laptop', 'icono' => 'Laptop', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Impresora', 'icono' => 'Printer', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Monitor', 'icono' => 'Monitor', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Teclado', 'icono' => 'Keyboard', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Mouse', 'icono' => 'Mouse', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Parlantes', 'icono' => 'Volume2', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Equipo de Red', 'icono' => 'Wifi', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Otro', 'icono' => 'Package', 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('tipo_bienes')->insert($tipos);
    }
}
