<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cargos', function (Blueprint $table) {
            $table->boolean('unico')->default(false)->after('descripcion');
        });
    }

    public function down(): void
    {
        Schema::table('cargos', function (Blueprint $table) {
            $table->dropColumn('unico');
        });
    }
};
