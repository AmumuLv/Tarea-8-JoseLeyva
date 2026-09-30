<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipo_bienes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('icono')->nullable();
            $table->string('estado')->default('activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipo_bienes');
    }
};
