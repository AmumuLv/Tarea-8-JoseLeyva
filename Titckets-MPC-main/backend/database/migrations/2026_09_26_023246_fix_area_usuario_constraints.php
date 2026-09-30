<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop foreign keys first
        DB::statement('ALTER TABLE `area_usuario` DROP FOREIGN KEY `area_usuario_area_id_foreign`');
        DB::statement('ALTER TABLE `area_usuario` DROP FOREIGN KEY `area_usuario_usuario_id_foreign`');
        DB::statement('ALTER TABLE `area_usuario` DROP FOREIGN KEY `area_usuario_cargo_id_foreign`');
        DB::statement('ALTER TABLE `area_usuario` DROP FOREIGN KEY `area_usuario_usuario_designador_id_foreign`');
        
        // Drop unique constraint
        DB::statement('ALTER TABLE `area_usuario` DROP INDEX `area_usuario_area_id_usuario_id_unique`');
        
        // Recreate foreign keys
        DB::statement('ALTER TABLE `area_usuario` ADD CONSTRAINT `area_usuario_area_id_foreign` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE');
        DB::statement('ALTER TABLE `area_usuario` ADD CONSTRAINT `area_usuario_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE');
        DB::statement('ALTER TABLE `area_usuario` ADD CONSTRAINT `area_usuario_cargo_id_foreign` FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`) ON DELETE SET NULL');
        DB::statement('ALTER TABLE `area_usuario` ADD CONSTRAINT `area_usuario_usuario_designador_id_foreign` FOREIGN KEY (`usuario_designador_id`) REFERENCES `users` (`id`) ON DELETE SET NULL');
        
        // Add new unique constraint allowing history: one active per area/user/cargo combination
        DB::statement('ALTER TABLE `area_usuario` ADD UNIQUE KEY `area_usuario_area_user_cargo_fecha_unique` (`area_id`, `usuario_id`, `cargo_id`, `fecha_inicio`)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE `area_usuario` DROP FOREIGN KEY `area_usuario_area_id_foreign`');
        DB::statement('ALTER TABLE `area_usuario` DROP FOREIGN KEY `area_usuario_usuario_id_foreign`');
        DB::statement('ALTER TABLE `area_usuario` DROP FOREIGN KEY `area_usuario_cargo_id_foreign`');
        DB::statement('ALTER TABLE `area_usuario` DROP FOREIGN KEY `area_usuario_usuario_designador_id_foreign`');
        
        DB::statement('ALTER TABLE `area_usuario` DROP INDEX `area_usuario_area_user_cargo_fecha_unique`');
        
        DB::statement('ALTER TABLE `area_usuario` ADD CONSTRAINT `area_usuario_area_id_foreign` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE');
        DB::statement('ALTER TABLE `area_usuario` ADD CONSTRAINT `area_usuario_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE');
        DB::statement('ALTER TABLE `area_usuario` ADD CONSTRAINT `area_usuario_cargo_id_foreign` FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`) ON DELETE SET NULL');
        DB::statement('ALTER TABLE `area_usuario` ADD CONSTRAINT `area_usuario_usuario_designador_id_foreign` FOREIGN KEY (`usuario_designador_id`) REFERENCES `users` (`id`) ON DELETE SET NULL');
        
        DB::statement('ALTER TABLE `area_usuario` ADD UNIQUE KEY `area_usuario_area_id_usuario_id_unique` (`area_id`, `usuario_id`)');
    }
};
