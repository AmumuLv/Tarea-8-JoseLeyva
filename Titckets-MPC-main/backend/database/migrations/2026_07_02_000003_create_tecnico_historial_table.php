<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tecnico_historial', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tecnico_id')->constrained('tecnicos')->cascadeOnDelete();
            $table->string('accion');
            $table->text('descripcion')->nullable();
            $table->foreignId('ticket_id')->nullable()->constrained('tickets')->nullOnDelete();
            $table->string('modelo')->nullable();
            $table->unsignedBigInteger('modelo_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tecnico_historial');
    }
};
