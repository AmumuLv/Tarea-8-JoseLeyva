<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const SEDES = [
        ['nombre' => 'Sede Principal', 'direccion' => null],
        ['nombre' => 'Complejo', 'direccion' => null],
        ['nombre' => 'Estadio Municipal', 'direccion' => null],
        ['nombre' => 'Serenazgo', 'direccion' => null],
    ];

    private const PERMISOS = ['ver_sedes', 'crear_sede', 'editar_sede', 'eliminar_sede'];

    public function up(): void
    {
        $now = now();

        foreach (self::SEDES as $sede) {
            $existe = DB::table('sedes')->where('nombre', $sede['nombre'])->exists();
            if (!$existe) {
                DB::table('sedes')->insert([
                    'nombre' => $sede['nombre'],
                    'direccion' => $sede['direccion'],
                    'estado' => 'activo',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        foreach (self::PERMISOS as $nombre) {
            $permiso = DB::table('permisos')->where('nombre', $nombre)->first();
            if (!$permiso) {
                $permisoId = DB::table('permisos')->insertGetId([
                    'nombre' => $nombre,
                    'modulo' => 'sedes',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } else {
                $permisoId = $permiso->id;
            }

            $roleExists = DB::table('roles')->where('id', 1)->exists();
            $asignado = DB::table('rol_permisos')
                ->where('rol_id', 1)
                ->where('permiso_id', $permisoId)
                ->exists();
            if ($roleExists && !$asignado) {
                DB::table('rol_permisos')->insert([
                    'rol_id' => 1,
                    'permiso_id' => $permisoId,
                ]);
            }
        }

        // Mapear bienes cuya ubicacion coincide con una sede existente
        $sedePrincipalId = DB::table('sedes')->where('nombre', 'Sede Principal')->value('id');
        foreach (DB::table('sedes')->get() as $sede) {
            DB::table('bienes')
                ->where('ubicacion', $sede->nombre)
                ->update(['sede_id' => $sede->id, 'ubicacion' => null, 'updated_at' => $now]);
        }
        // Alias historico "Sede Central" -> Sede Principal
        if ($sedePrincipalId) {
            DB::table('bienes')
                ->where('ubicacion', 'Sede Central')
                ->update(['sede_id' => $sedePrincipalId, 'ubicacion' => null, 'updated_at' => $now]);
        }
    }

    public function down(): void
    {
        $sedeIds = DB::table('sedes')->whereIn('nombre', array_column(self::SEDES, 'nombre'))->pluck('id');
        DB::table('bienes')->whereIn('sede_id', $sedeIds)->update(['sede_id' => null]);

        $permisoIds = DB::table('permisos')->whereIn('nombre', self::PERMISOS)->pluck('id');
        DB::table('rol_permisos')->whereIn('permiso_id', $permisoIds)->where('rol_id', 1)->delete();
        DB::table('permisos')->whereIn('nombre', self::PERMISOS)->delete();
        DB::table('sedes')->whereIn('nombre', array_column(self::SEDES, 'nombre'))->delete();
    }
};
