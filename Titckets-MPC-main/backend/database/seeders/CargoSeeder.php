<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cargo;

class CargoSeeder extends Seeder
{
    public function run(): void
    {
        $cargos = [
            // Cargos ÚNICOS (solo uno en todo el sistema)
            ['nombre' => 'Alcalde', 'descripcion' => 'Máxima autoridad edilicia municipal', 'estado' => 'activo', 'unico' => true],
            ['nombre' => 'Gerente Municipal', 'descripcion' => 'Máxima autoridad ejecutiva municipal', 'estado' => 'activo', 'unico' => true],
            ['nombre' => 'Procuradora', 'descripcion' => 'Defensa jurídica de la municipalidad', 'estado' => 'activo', 'unico' => true],

            // Cargos MÚLTIPLES (pueden repetirse en distintas áreas)
            ['nombre' => 'Gerente', 'descripcion' => 'Gerencia de área funcional', 'estado' => 'activo', 'unico' => false],
            ['nombre' => 'Subgerente', 'descripcion' => 'Subgerencia de área funcional', 'estado' => 'activo', 'unico' => false],
            ['nombre' => 'Jefe de Oficina', 'descripcion' => 'Jefatura de oficina administrativa', 'estado' => 'activo', 'unico' => false],

            // Genérico para áreas usuarias
            ['nombre' => 'Área Institucional', 'descripcion' => 'Usuario genérico de área institucional', 'estado' => 'activo', 'unico' => false],
        ];

        foreach ($cargos as $cargoData) {
            Cargo::firstOrCreate(
                ['nombre' => $cargoData['nombre']],
                $cargoData
            );
        }

        $this->command->info('Se crearon ' . count($cargos) . ' cargos correctamente.');
    }
}