<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('system:check', function () {
    $errors = 0;
    $warnings = 0;

    $ok = function (string $message): void {
        $this->info("[OK] {$message}");
    };

    $fail = function (string $message) use (&$errors): void {
        $errors++;
        $this->error("[ERROR] {$message}");
    };

    $warn = function (string $message) use (&$warnings): void {
        $warnings++;
        $this->warn("[AVISO] {$message}");
    };

    $this->newLine();
    $this->info('MPC Service Desk - comprobacion de estabilizacion');
    $this->line(str_repeat('-', 56));

    if (version_compare(PHP_VERSION, '8.3.0', '>=')) {
        $ok('PHP ' . PHP_VERSION . ' compatible (>= 8.3).');
    } else {
        $fail('PHP ' . PHP_VERSION . ' no es compatible. Se requiere PHP 8.3 o superior.');
    }

    $nodeVersion = trim((string) @shell_exec('node --version 2>&1'));
    if (preg_match('/v?(\d+\.\d+\.\d+)/', $nodeVersion, $match)) {
        $version = $match[1];
        $node20Compatible = version_compare($version, '20.19.0', '>=') && version_compare($version, '21.0.0', '<');
        $node22PlusCompatible = version_compare($version, '22.12.0', '>=');

        if ($node20Compatible || $node22PlusCompatible) {
            $ok("Node {$version} compatible con Vite 8.");
        } else {
            $fail("Node {$version} no es compatible con Vite 8. Usa Node 20.19+ o 22.12+ (22 LTS recomendado).");
        }
    } else {
        $warn('No se pudo detectar Node.js desde esta terminal.');
    }

    if (is_file(base_path('.env'))) {
        $ok('Archivo .env presente.');
    } else {
        $fail('Falta backend/.env. Ejecuta composer setup o copia .env.example.');
    }

    if (config('app.key')) {
        $ok('APP_KEY configurada.');
    } else {
        $fail('APP_KEY vacia. Ejecuta php scripts/ensure-environment.php.');
    }

    if (config('jwt.secret')) {
        $ok('JWT_SECRET configurado.');
    } else {
        $fail('JWT_SECRET vacio. Ejecuta php scripts/ensure-environment.php.');
    }

    if (file_exists(public_path('storage'))) {
        $ok('Enlace public/storage disponible.');
    } else {
        $fail('Falta public/storage. Ejecuta php artisan storage:link para visualizar evidencias.');
    }

    foreach ([storage_path(), base_path('bootstrap/cache')] as $directory) {
        if (is_dir($directory) && is_writable($directory)) {
            $ok("Directorio escribible: {$directory}");
        } else {
            $fail("Laravel no puede escribir en {$directory}");
        }
    }

    $dbReady = false;
    try {
        DB::connection()->getPdo();
        $dbReady = true;
        $database = DB::connection()->getDatabaseName();
        $ok("Conexion a base de datos correcta ({$database}).");
    } catch (Throwable $e) {
        $fail('No se pudo conectar a la base de datos: ' . $e->getMessage());
    }

    if ($dbReady) {
        $requiredTables = [
            'migrations', 'roles', 'permisos', 'users', 'areas', 'area_usuario',
            'tecnicos', 'tickets', 'ticket_historial', 'ticket_respuestas',
            'ticket_evidencias', 'cargos', 'tipo_bienes', 'bienes',
            'bien_especificaciones', 'bien_historial', 'sedes',
        ];

        $missing = array_values(array_filter($requiredTables, fn (string $table) => !Schema::hasTable($table)));
        if ($missing === []) {
            $ok('Tablas principales presentes.');
        } else {
            $fail('Faltan tablas: ' . implode(', ', $missing) . '. Ejecuta php artisan migrate.');
        }

        if (Schema::hasTable('migrations')) {
            $migrationFiles = glob(database_path('migrations/*.php')) ?: [];
            $executed = (int) DB::table('migrations')->count();
            if ($executed < count($migrationFiles)) {
                $warn('Hay migraciones pendientes o el historial de migraciones no coincide con los archivos. Revisa php artisan migrate:status.');
            } else {
                $ok('Cantidad de migraciones ejecutadas compatible con los archivos actuales.');
            }
        }

        foreach (['cargos', 'tipo_bienes'] as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            $duplicates = DB::table($table)
                ->select('nombre')
                ->whereNotNull('nombre')
                ->groupBy('nombre')
                ->havingRaw('COUNT(*) > 1')
                ->pluck('nombre');

            if ($duplicates->isEmpty()) {
                $ok("Sin nombres duplicados en {$table}.");
            } else {
                $fail("Duplicados en {$table}: " . $duplicates->take(5)->implode(', '));
            }
        }

        if (Schema::hasTable('tickets') && Schema::hasTable('users')) {
            $assignedOrphans = DB::table('tickets')
                ->leftJoin('users', 'tickets.asignado_a', '=', 'users.id')
                ->whereNotNull('tickets.asignado_a')
                ->whereNull('users.id')
                ->count();

            $creatorOrphans = DB::table('tickets')
                ->leftJoin('users', 'tickets.creado_por', '=', 'users.id')
                ->whereNotNull('tickets.creado_por')
                ->whereNull('users.id')
                ->count();

            if ($assignedOrphans === 0 && $creatorOrphans === 0) {
                $ok('Tickets sin referencias huerfanas a usuarios.');
            } else {
                $fail("Tickets huerfanos: asignado_a={$assignedOrphans}, creado_por={$creatorOrphans}.");
            }
        }

        if (Schema::hasTable('bienes')) {
            $checks = [
                'area_id' => 'areas',
                'tipo_bien_id' => 'tipo_bienes',
                'sede_id' => 'sedes',
            ];

            foreach ($checks as $column => $parentTable) {
                if (!Schema::hasTable($parentTable) || !Schema::hasColumn('bienes', $column)) {
                    continue;
                }

                $orphans = DB::table('bienes')
                    ->leftJoin($parentTable, "bienes.{$column}", '=', "{$parentTable}.id")
                    ->whereNotNull("bienes.{$column}")
                    ->whereNull("{$parentTable}.id")
                    ->count();

                if ($orphans === 0) {
                    $ok("Bienes sin referencias huerfanas en {$column}.");
                } else {
                    $fail("Hay {$orphans} bienes con {$column} huerfano.");
                }
            }
        }
    }

    foreach (['SEED_ADMIN_PASSWORD', 'SEED_AREA_PASSWORD', 'SEED_TECNICO_PASSWORD'] as $key) {
        if (!env($key)) {
            $warn("{$key} no esta definido. Solo es necesario antes de ejecutar db:seed.");
        }
    }

    $this->newLine();
    if ($errors === 0) {
        $this->info("Resultado: estable para iniciar ({$warnings} aviso(s)).");
        return 0;
    }

    $this->error("Resultado: {$errors} error(es) y {$warnings} aviso(s). Corrige los errores antes de continuar.");
    return 1;
})->purpose('Comprueba entorno, almacenamiento y consistencia basica de la base de datos');
