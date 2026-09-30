<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Separación de nombres completos que el PersonalSeeder guardó
     * enteros en "nombres" dejando "apellidos" vacío.
     * Clave: DNI => [nombres, apellidos].
     * Las entradas que venían como [apellidos][nombres] se reordenan
     * a formato estándar [nombres][apellidos].
     */
    private array $splits = [
        '43323464' => ['Manuel Enrique', 'Murriel Montes'],
        '44775860' => ['Juan Manuel', 'Sanchez Huertas'],
        '08653985' => ['Cesar Leonardo', 'Perez Mejia'],
        '32130801' => ['Luis Alberto', 'Murriel Santolalla'],
        '32131474' => ['Jose Carlo', 'Cespedes Quiñones'],
        '32100339' => ['Efraín Fernando', 'Lockuan Lavado'],
        '32101952' => ['Javier Nicanor', 'Cabello Polo'],
        '70899198' => ['Pedro Deyvis', 'Lopez Velasquez'],
        '18147332' => ['Tania Marcela', 'Torres Saenz'],
        '32110351' => ['César Adolfo', 'Villafranca Chávez'],
        '44027447' => ['Wilfredo Nain', 'Silva Mallqui'],
        '07480940' => ['Richer Fredy', 'Norabuena Jacome'],
        '32105076' => ['Neldvin', 'Salinas Cano'],
        '43590989' => ['Alexis Ricardo', 'Escobar Gil'],
        '08783482' => ['Maria Jackeline', 'Cabrera La Rosa'],
        '46223837' => ['Yholvi Cristian', 'Alejo Minaya'],
        '71820346' => ['Martin Alejandro', 'Colichon Calderon'],
        '70920870' => ["Niki D'Angelo", 'Higueras Konfu'],
        '46715848' => ['Hans Edgardo', 'Ramos Chamorro'],
        '16745937' => ['Octavio', 'Verona Sánchez'],
        '04743097' => ['Víctor', 'Alayo Chicalla'],
        '43720055' => ['Timoteo Macario', 'Sata Maria Gabino'],
        '44262641' => ['Grober Wilfredo', 'Chavez Baylon'],
        '40996382' => ['Gilmer Ronald', 'Castillo Chavez'],
        '70353563' => ['Yoice Marrelly', 'Roque Huiza'],
        '80253161' => ['Jose Ricardo', 'Llanos Colonia'],
        '42168243' => ['Charly James', 'Hernandez Malpica'],
        '41242454' => ['Alan Tino', 'Honores Vasquez'],
        '42445089' => ['Isaac Luis', 'Blaz Ortiz'],
        '48316946' => ['Katherine Edith', 'Chancafe Canchis'],
        '43794859' => ['Lyang Rosmery', 'Miranda Falcón'],
        '45494427' => ['Milagros Teresa', 'Alegre Quito'],
        '24699052' => ['Gregory Armando', 'Lopez Solis'],
        '72691555' => ['Joselin Lloysi', 'Léon Paredes'],
        '70354264' => ['Rhoydi Luvick', 'Quiroz Santos'],
        '44089836' => ['Jose Frank', 'Gonzales Garcia'],
        '43482800' => ['Susan Evelyn', 'Montero Nuñez'],
        '45787353' => ['Rommel Enrique', 'Flores Vega'],
        '73634385' => ['Diego Rafael', 'Santolalla Arias'],
        '41599684' => ['Paul Dagoberto', 'Montero Quispe'],
        '41212315' => ['Karen Janeth', 'Lavado Vera'],
        '41637460' => ['Jorge', 'Minchola Ortiz'],
        '45598760' => ['Alberto Jaime', 'Tinoco Usua'],
        '40355759' => ['Miguel Angel', 'Milla Cruz'],
        '32960944' => ['Cecilia Veronica', 'Wilson Llerena'],
        '17844952' => ['Enrique Alfonso', 'Abanto Diaz'],
        '43355091' => ['Melissa Cristina', 'Guzmán Garro'],
        '32109596' => ['Julio Cesar', 'Melendez Lazaro'],
        '42862472' => ['Junior Maycol', 'Acosta Salgado'],
        '40804277' => ['Carlos Jose', 'Peje Quesada'],
    ];

    public function up(): void
    {
        foreach ($this->splits as $dni => [$nombres, $apellidos]) {
            DB::table('users')
                ->where('dni', (string) $dni)
                ->where(function ($q) {
                    $q->whereNull('apellidos')->orWhere('apellidos', '');
                })
                ->update([
                    'nombres' => $nombres,
                    'apellidos' => $apellidos,
                    'name' => trim($nombres . ' ' . $apellidos),
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // Separación de datos irreversible (no se fusiona de vuelta).
    }
};
