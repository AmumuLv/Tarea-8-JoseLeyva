<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('area_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('areas')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->date('fecha_asignacion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['area_id', 'usuario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area_usuario');
    }
};
