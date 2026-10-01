<?php

namespace Database\Seeders;

use App\Models\TipoBien;
use Illuminate\Database\Seeder;

class TipoBienSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Computadora de Escritorio', 'icono' => 'Monitor', 'estado' => 'activo'],
            ['nombre' => 'Laptop', 'icono' => 'Laptop', 'estado' => 'activo'],
            ['nombre' => 'Impresora', 'icono' => 'Printer', 'estado' => 'activo'],
            ['nombre' => 'Monitor', 'icono' => 'Monitor', 'estado' => 'activo'],
            ['nombre' => 'Teclado', 'icono' => 'Keyboard', 'estado' => 'activo'],
            ['nombre' => 'Mouse', 'icono' => 'Mouse', 'estado' => 'activo'],
            ['nombre' => 'Parlantes', 'icono' => 'Volume2', 'estado' => 'activo'],
            ['nombre' => 'Equipo de Red', 'icono' => 'Wifi', 'estado' => 'activo'],
            ['nombre' => 'Otro', 'icono' => 'Package', 'estado' => 'activo'],
        ];

        foreach ($tipos as $tipo) {
            TipoBien::updateOrCreate(
                ['nombre' => $tipo['nombre']],
                ['icono' => $tipo['icono'], 'estado' => $tipo['estado']]
            );
        }
    }
}
