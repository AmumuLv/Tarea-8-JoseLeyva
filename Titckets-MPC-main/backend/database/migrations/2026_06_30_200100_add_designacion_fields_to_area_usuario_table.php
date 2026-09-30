<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('area_usuario', function (Blueprint $table) {
            $table->foreignId('cargo_id')->nullable()->constrained('cargos')->nullOnDelete()->after('cargo');
            $table->string('tipo_designacion')->nullable()->after('cargo_id');
            $table->foreignId('usuario_designador_id')->nullable()->constrained('users')->nullOnDelete()->after('tipo_designacion');
        });
    }

    public function down(): void
    {
        Schema::table('area_usuario', function (Blueprint $table) {
            $table->dropForeign(['cargo_id']);
            $table->dropColumn(['cargo_id', 'tipo_designacion', 'usuario_designador_id']);
        });
    }
};
