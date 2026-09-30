<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->timestamp('fecha_limite')->nullable()->after('asignado_a');
            $table->string('sla_estado')->default('dentro')->after('fecha_limite');
            $table->integer('tiempo_estimado_minutos')->nullable()->after('sla_estado');
            $table->text('impacto')->nullable()->after('tiempo_estimado_minutos');
            $table->text('urgencia')->nullable()->after('impacto');
            $table->integer('usuarios_afectados')->default(1)->after('urgencia');
            $table->unsignedTinyInteger('calificacion')->nullable()->after('usuarios_afectados');
            $table->text('calificacion_comentario')->nullable()->after('calificacion');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'fecha_limite', 'sla_estado', 'tiempo_estimado_minutos',
                'impacto', 'urgencia', 'usuarios_afectados',
                'calificacion', 'calificacion_comentario',
            ]);
        });
    }
};
