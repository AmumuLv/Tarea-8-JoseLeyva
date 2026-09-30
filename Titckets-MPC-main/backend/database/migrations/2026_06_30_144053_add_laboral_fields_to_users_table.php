<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('correo_institucional')->nullable()->after('email');
            $table->date('fecha_ingreso')->nullable()->after('correo_institucional');
            $table->date('fecha_cese')->nullable()->after('fecha_ingreso');
            $table->boolean('actualmente_laborando')->default(true)->after('fecha_cese');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['correo_institucional', 'fecha_ingreso', 'fecha_cese', 'actualmente_laborando']);
        });
    }
};
