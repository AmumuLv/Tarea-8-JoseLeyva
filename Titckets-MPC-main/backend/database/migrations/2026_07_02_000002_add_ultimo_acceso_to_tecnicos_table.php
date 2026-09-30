<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tecnicos', function (Blueprint $table) {
            $table->timestamp('ultimo_acceso')->nullable()->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('tecnicos', function (Blueprint $table) {
            $table->dropColumn('ultimo_acceso');
        });
    }
};
