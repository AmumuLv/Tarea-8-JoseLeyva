<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bienes', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 30)->unique();
            $table->foreignId('tipo_bien_id')->constrained('tipo_bienes');
            $table->foreignId('area_id')->constrained('areas');
            $table->string('estado')->default('operativo');
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->string('numero_serie')->nullable();
            $table->string('codigo_patrimonial')->nullable();
            $table->string('ubicacion')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bienes');
    }
};
