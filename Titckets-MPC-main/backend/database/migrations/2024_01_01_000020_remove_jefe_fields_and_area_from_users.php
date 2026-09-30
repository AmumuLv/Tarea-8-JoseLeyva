<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['area_id']);
            $table->dropColumn('area_id');
            $table->dropColumn([
                'jefe_nombre',
                'jefe_apellido',
                'jefe_cargo',
                'jefe_documento',
                'jefe_email',
                'jefe_telefono',
                'jefe_foto',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('area_id')->nullable()->constrained('areas');
            $table->string('jefe_nombre')->nullable()->after('avatar');
            $table->string('jefe_apellido')->nullable()->after('jefe_nombre');
            $table->string('jefe_cargo')->nullable()->after('jefe_apellido');
            $table->string('jefe_documento')->nullable()->after('jefe_cargo');
            $table->string('jefe_email')->nullable()->after('jefe_documento');
            $table->string('jefe_telefono')->nullable()->after('jefe_email');
            $table->string('jefe_foto')->nullable()->after('jefe_telefono');
        });
    }
};
