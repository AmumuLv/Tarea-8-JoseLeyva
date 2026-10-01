<?php

namespace Tests;

use Database\Seeders\PermisoSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\RolPermisoSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Schema;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Las pruebas de integración parten de una BD MySQL migrada pero no
        // deben depender de que alguien haya ejecutado db:seed manualmente.
        // Se cargan únicamente catálogos de autorización, sin usuarios reales
        // ni datos funcionales del sistema.
        if (Schema::hasTable('roles') && Schema::hasTable('permisos') && Schema::hasTable('rol_permisos')) {
            $this->seed(RoleSeeder::class);
            $this->seed(PermisoSeeder::class);
            $this->seed(RolPermisoSeeder::class);
        }
    }
}
