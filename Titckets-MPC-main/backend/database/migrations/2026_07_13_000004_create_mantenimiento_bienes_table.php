<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mantenimiento_bienes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bien_id')->constrained('bienes')->cascadeDelete();
            $table->foreignId('tecnico_id')->nullable()->constrained('tecnicos')->nullOnDelete();
            $table->date('fecha');
            $table->string('tipo_mantenimiento')->nullable();
            $table->text('descripcion')->nullable();
            $table->string('estado')->default('completado');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mantenimiento_bienes');
    }
};
