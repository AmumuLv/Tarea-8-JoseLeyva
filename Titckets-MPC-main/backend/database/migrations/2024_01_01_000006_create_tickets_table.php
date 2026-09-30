<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->string('titulo');
            $table->text('descripcion');
            $table->string('categoria');
            $table->string('prioridad')->default('media');
            $table->string('estado')->default('pendiente');
            $table->foreignId('area_id')->constrained('areas');
            $table->foreignId('creado_por')->constrained('users');
            $table->foreignId('asignado_a')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
