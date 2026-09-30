<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tecnicos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->string('alias');
            $table->string('nombres')->nullable();
            $table->string('apellidos')->nullable();
            $table->string('usuario')->unique();
            $table->string('password');
            $table->string('estado')->default('activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tecnicos');
    }
};
