<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jefe_historial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('jefe_nombre');
            $table->string('jefe_apellido');
            $table->string('jefe_cargo');
            $table->string('jefe_documento')->nullable();
            $table->string('jefe_email')->nullable();
            $table->string('jefe_telefono')->nullable();
            $table->string('jefe_foto')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->foreignId('cambiado_por')->nullable()->constrained('users');
            $table->text('motivo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jefe_historial');
    }
};
