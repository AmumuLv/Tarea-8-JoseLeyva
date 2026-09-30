<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nombres')->after('id');
            $table->string('apellidos')->after('nombres');
            $table->string('username')->after('apellidos')->unique();
            $table->string('dni')->nullable()->after('username');
            $table->string('cargo')->nullable()->after('dni');
            $table->string('telefono')->nullable()->after('cargo');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nombres', 'apellidos', 'username', 'dni', 'cargo', 'telefono']);
        });
    }
};
