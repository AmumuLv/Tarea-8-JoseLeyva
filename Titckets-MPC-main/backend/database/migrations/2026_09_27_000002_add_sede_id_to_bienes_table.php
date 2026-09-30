<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bienes', function (Blueprint $table) {
            $table->foreignId('sede_id')
                ->nullable()
                ->after('area_id')
                ->constrained('sedes')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bienes', function (Blueprint $table) {
            $table->dropForeign(['sede_id']);
            $table->dropColumn('sede_id');
        });
    }
};
