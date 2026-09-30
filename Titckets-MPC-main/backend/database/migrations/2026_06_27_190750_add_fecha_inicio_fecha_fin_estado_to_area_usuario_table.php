<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('area_usuario', function (Blueprint $table) {
            $table->date('fecha_inicio')->nullable()->after('activo');
            $table->date('fecha_fin')->nullable()->after('fecha_inicio');
            $table->string('estado_asignacion', 20)->default('activo')->after('fecha_fin');
        });

        DB::table('area_usuario')->where('activo', true)->update(['estado_asignacion' => 'activo']);
        DB::table('area_usuario')->where('activo', false)->update([
            'estado_asignacion' => 'finalizado',
            'fecha_fin' => DB::raw('fecha_asignacion'),
        ]);
        DB::table('area_usuario')->whereNull('fecha_inicio')->update([
            'fecha_inicio' => DB::raw('fecha_asignacion'),
        ]);
    }

    public function down(): void
    {
        Schema::table('area_usuario', function (Blueprint $table) {
            $table->dropColumn(['fecha_inicio', 'fecha_fin', 'estado_asignacion']);
        });
    }
};
