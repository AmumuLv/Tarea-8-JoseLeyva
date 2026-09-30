<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Índices de consulta frecuentes.
        Schema::table('tickets', function (Blueprint $table) {
            $table->index('creado_por');
            $table->index('asignado_a');
            $table->index('estado');
            $table->index('categoria');
        });

        Schema::table('area_usuario', function (Blueprint $table) {
            $table->index('usuario_id');
        });

        Schema::table('jefe_historial', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('user_audit', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('bienes', function (Blueprint $table) {
            $table->index('tipo_bien_id');
            $table->index('area_id');
            $table->index('estado');
        });

        // bien_historial.usuario era texto libre. Solo se asigna un usuario_id
        // cuando el nombre identifica a UNA sola persona. Si es ambiguo, se
        // conserva el valor histórico dentro de la descripción para no atribuir
        // una acción al usuario equivocado.
        if (!Schema::hasColumn('bien_historial', 'usuario_id')) {
            Schema::table('bien_historial', function (Blueprint $table) {
                $table->foreignId('usuario_id')
                    ->nullable()
                    ->after('descripcion')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasColumn('bien_historial', 'usuario')) {
            $usuariosUnicos = DB::table('users')
                ->select('nombres', DB::raw('MIN(id) as id'), DB::raw('COUNT(*) as total'))
                ->whereNotNull('nombres')
                ->where('nombres', '!=', '')
                ->groupBy('nombres')
                ->havingRaw('COUNT(*) = 1')
                ->get()
                ->keyBy('nombres');

            DB::table('bien_historial')
                ->whereNotNull('usuario')
                ->orderBy('id')
                ->chunkById(200, function ($rows) use ($usuariosUnicos) {
                    foreach ($rows as $row) {
                        $legacyUser = trim((string) $row->usuario);
                        if ($legacyUser === '') {
                            continue;
                        }

                        $match = $usuariosUnicos->get($legacyUser);
                        if ($match) {
                            DB::table('bien_historial')
                                ->where('id', $row->id)
                                ->update(['usuario_id' => $match->id]);
                            continue;
                        }

                        $descripcion = trim((string) ($row->descripcion ?? ''));
                        $sufijo = "[Usuario histórico: {$legacyUser}]";
                        if (!str_contains($descripcion, $sufijo)) {
                            $descripcion = trim($descripcion . ' ' . $sufijo);
                            DB::table('bien_historial')
                                ->where('id', $row->id)
                                ->update(['descripcion' => $descripcion]);
                        }
                    }
                });

            Schema::table('bien_historial', function (Blueprint $table) {
                $table->dropColumn('usuario');
            });
        }

        // Consolidar columnas duplicadas conservando los datos existentes.
        if (Schema::hasColumn('users', 'avatar')) {
            DB::table('users')
                ->whereNull('foto')
                ->whereNotNull('avatar')
                ->update(['foto' => DB::raw('avatar')]);

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('avatar');
            });
        }

        if (Schema::hasColumn('areas', 'email')) {
            DB::table('areas')
                ->whereNull('correo')
                ->whereNotNull('email')
                ->update(['correo' => DB::raw('email')]);

            Schema::table('areas', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }

        // Las contraseñas de áreas no deben almacenarse en texto plano.
        if (Schema::hasColumn('areas', 'password_correo')) {
            Schema::table('areas', function (Blueprint $table) {
                $table->dropColumn('password_correo');
            });
        }

        // Antes de crear restricciones UNIQUE se valida explícitamente para
        // evitar una falla de migración poco clara o una limpieza automática
        // que pudiera borrar información real.
        $this->assertNoDuplicateNames('cargos');
        $this->assertNoDuplicateNames('tipo_bienes');

        Schema::table('cargos', function (Blueprint $table) {
            $table->unique('nombre');
        });

        Schema::table('tipo_bienes', function (Blueprint $table) {
            $table->unique('nombre');
        });

        // No se fuerza email/password a NOT NULL y tampoco se crean valores
        // placeholder. Las migraciones posteriores permiten ambos campos
        // nullable para soportar registros de personal sin cuenta de acceso.
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

        if (!Schema::hasColumn('bien_historial', 'usuario')) {
            Schema::table('bien_historial', function (Blueprint $table) {
                $table->string('usuario')->nullable()->after('descripcion');
            });
        }

        if (Schema::hasColumn('bien_historial', 'usuario_id')) {
            Schema::table('bien_historial', function (Blueprint $table) {
                $table->dropForeign(['usuario_id']);
                $table->dropColumn('usuario_id');
            });
        }

        if (!Schema::hasColumn('users', 'avatar')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('avatar')->nullable();
            });
        }

        if (!Schema::hasColumn('areas', 'email') || !Schema::hasColumn('areas', 'password_correo')) {
            Schema::table('areas', function (Blueprint $table) {
                if (!Schema::hasColumn('areas', 'email')) {
                    $table->string('email')->nullable();
                }
                if (!Schema::hasColumn('areas', 'password_correo')) {
                    $table->string('password_correo')->nullable();
                }
            });
        }

        Schema::table('cargos', function (Blueprint $table) {
            $table->dropUnique(['nombre']);
        });

        Schema::table('tipo_bienes', function (Blueprint $table) {
            $table->dropUnique(['nombre']);
        });
    }

    private function assertNoDuplicateNames(string $table): void
    {
        $duplicados = DB::table($table)
            ->select('nombre')
            ->whereNotNull('nombre')
            ->groupBy('nombre')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('nombre');

        if ($duplicados->isNotEmpty()) {
            throw new RuntimeException(
                "No se puede crear UNIQUE en {$table}.nombre. Corrige primero los duplicados: " .
                $duplicados->take(10)->implode(', ')
            );
        }
    }
};
