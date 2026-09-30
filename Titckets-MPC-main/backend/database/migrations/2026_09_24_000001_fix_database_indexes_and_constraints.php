<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add missing indexes on tickets
        Schema::table('tickets', function (Blueprint $table) {
            $table->index('creado_por');
            $table->index('asignado_a');
            $table->index('estado');
            $table->index('categoria');
        });

        // 2. Add missing index on area_usuario
        Schema::table('area_usuario', function (Blueprint $table) {
            $table->index('usuario_id');
        });

        // 3. Add missing index on jefe_historial
        Schema::table('jefe_historial', function (Blueprint $table) {
            $table->index('user_id');
        });

        // 4. Add missing index on user_audit
        Schema::table('user_audit', function (Blueprint $table) {
            $table->index('user_id');
        });

        // 5. Add missing indexes on bienes
        Schema::table('bienes', function (Blueprint $table) {
            $table->index('tipo_bien_id');
            $table->index('area_id');
            $table->index('estado');
        });

        // 6. Fix bien_historial.usuario string → FK to users
        Schema::table('bien_historial', function (Blueprint $table) {
            $table->foreignId('usuario_id')->nullable()->after('descripcion')->constrained('users')->nullOnDelete();
        });
        // Migrate data from string to FK where possible
        DB::statement('UPDATE bien_historial bh
            INNER JOIN users u ON bh.usuario = u.nombres
            SET bh.usuario_id = u.id
            WHERE bh.usuario IS NOT NULL');
        Schema::table('bien_historial', function (Blueprint $table) {
            $table->dropColumn('usuario');
        });

        // 7. Consolidate duplicate photo columns: keep foto, drop avatar
        // Migrate data from avatar to foto where foto is null
        DB::statement('UPDATE users SET foto = avatar WHERE foto IS NULL AND avatar IS NOT NULL');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });

        // 8. Consolidate duplicate email columns in areas: keep correo, drop email
        // Migrate data from email to correo where correo is null
        DB::statement('UPDATE areas SET correo = email WHERE correo IS NULL AND email IS NOT NULL');
        Schema::table('areas', function (Blueprint $table) {
            $table->dropColumn('email');
        });

        // 9. Remove password_correo plain text column from areas
        Schema::table('areas', function (Blueprint $table) {
            $table->dropColumn('password_correo');
        });

        // 10. Add unique constraint to cargos.nombre
        Schema::table('cargos', function (Blueprint $table) {
            $table->unique('nombre');
        });

        // 11. Add unique constraint to tipo_bienes.nombre
        Schema::table('tipo_bienes', function (Blueprint $table) {
            $table->unique('nombre');
        });

        // 12 & 13. Fix email and password nullable in users
        // First, handle any null values
        DB::statement("UPDATE users SET email = 'unknown@placeholder.com' WHERE email IS NULL");
        DB::statement("UPDATE users SET password = '" . bcrypt('changeme') . "' WHERE password IS NULL");
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['creado_por']);
            $table->dropIndex(['asignado_a']);
            $table->dropIndex(['estado']);
            $table->dropIndex(['categoria']);
        });

        Schema::table('area_usuario', function (Blueprint $table) {
            $table->dropIndex(['usuario_id']);
        });

        Schema::table('jefe_historial', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('user_audit', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('bienes', function (Blueprint $table) {
            $table->dropIndex(['tipo_bien_id']);
            $table->dropIndex(['area_id']);
            $table->dropIndex(['estado']);
        });

        Schema::table('bien_historial', function (Blueprint $table) {
            $table->string('usuario')->nullable()->after('descripcion');
            $table->dropForeign(['usuario_id']);
            $table->dropColumn('usuario_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable();
        });

        Schema::table('areas', function (Blueprint $table) {
            $table->string('email')->nullable();
            $table->string('password_correo')->nullable();
        });

        Schema::table('cargos', function (Blueprint $table) {
            $table->dropUnique(['nombre']);
        });

        Schema::table('tipo_bienes', function (Blueprint $table) {
            $table->dropUnique(['nombre']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }
};
