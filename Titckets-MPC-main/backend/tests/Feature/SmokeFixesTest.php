<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SmokeFixesTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        if (!\Schema::hasTable('tickets') || !\Schema::hasTable('area_usuario')) {
            $this->markTestSkipped('Requiere base de datos migrada (MySQL). Ejecutar con DB_CONNECTION=mysql.');
        }
    }

    private function seedBase(): array
    {
        $now = now();
        \DB::table('roles')->insertOrIgnore([
            ['id' => 1, 'nombre' => 'Administrador', 'created_at' => $now, 'updated_at' => $now],
            ['id' => 2, 'nombre' => 'Tecnico', 'created_at' => $now, 'updated_at' => $now],
            ['id' => 3, 'nombre' => 'Area Usuaria', 'created_at' => $now, 'updated_at' => $now],
            ['id' => 4, 'nombre' => 'Personal', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $admin = \App\Models\User::where('rol_id', 1)->first();
        if (!$admin) {
            $admin = \App\Models\User::create([
                'nombres' => 'Admin', 'apellidos' => 'SmokeTest', 'name' => 'Admin SmokeTest',
                'email' => 'admin.smoketest@test.com', 'username' => 'admin.smoketest@test.com',
                'password' => bcrypt('secret123'), 'dni' => '99887766',
                'rol_id' => 1, 'estado' => 'activo',
            ]);
        }

        $area = \App\Models\Area::create(['nombre' => 'Area SmokeDemo', 'correo' => 'smokedemo@test.com', 'estado' => 'activo']);

        $cargo = \App\Models\Cargo::create(['nombre' => 'Cargo SmokeDemo', 'estado' => 'activo', 'unico' => false]);

        return [$admin, $area, $cargo];
    }

    private function authJson(string $method, string $uri, \App\Models\User $admin, array $data = [])
    {
        $token = auth('api')->login($admin);
        $req = $this->withHeader('Authorization', 'Bearer ' . $token);
        return match ($method) {
            'GET' => $req->getJson($uri),
            'POST' => $req->postJson($uri, $data),
            'PUT' => $req->putJson($uri, $data),
            'DELETE' => $req->delete($uri),
            default => throw new \InvalidArgumentException($method),
        };
    }

    public function test_ticket_store_sin_500_y_crea_historial(): void
    {
        [$admin, $area] = $this->seedBase();

        $resp = $this->authJson('POST', '/api/v1/tickets', $admin, [
            'titulo' => 'Ticket prueba smoke',
            'descripcion' => 'Descripcion prueba',
            'categoria' => 'Hardware',
            'area_id' => $area->id,
        ]);

        $resp->assertStatus(201);
        $ticket = \App\Models\Ticket::first();
        $this->assertNotNull($ticket);
        $this->assertStringStartsWith('TKT-', $ticket->numero);
        $this->assertDatabaseHas('ticket_historial', [
            'ticket_id' => $ticket->id,
            'tipo_cambio' => 'creacion',
        ]);
    }

    public function test_finalizar_designacion_sin_500(): void
    {
        [$admin, $area, $cargo] = $this->seedBase();

        $user = \App\Models\User::create([
            'nombres' => 'Persona', 'apellidos' => 'Smoke', 'name' => 'Persona Smoke',
            'email' => 'persona.smoke@test.com', 'username' => 'persona.smoke@test.com',
            'password' => bcrypt('secret123'), 'dni' => '99887755',
            'rol_id' => 4, 'estado' => 'activo',
        ]);

        $desig = \App\Models\AreaUsuario::create([
            'area_id' => $area->id,
            'usuario_id' => $user->id,
            'cargo_id' => $cargo->id,
            'tipo_designacion' => 'Titular',
            'usuario_designador_id' => $admin->id,
            'fecha_asignacion' => now(),
            'fecha_inicio' => now(),
            'activo' => true,
            'estado_asignacion' => 'activo',
        ]);

        $resp = $this->authJson('PUT', "/api/v1/designaciones/{$desig->id}/finalizar", $admin);
        $resp->assertStatus(200);

        $this->assertDatabaseHas('area_usuario', [
            'id' => $desig->id,
            'estado_asignacion' => 'finalizado',
        ]);
    }

    public function test_busqueda_designaciones_no_filtra_finalizadas(): void
    {
        [$admin, $area, $cargo] = $this->seedBase();

        $userActivo = \App\Models\User::create([
            'nombres' => 'Activa', 'apellidos' => 'Smoke', 'name' => 'Activa Smoke',
            'email' => 'activa.smoke@test.com', 'username' => 'activa.smoke@test.com',
            'password' => bcrypt('secret123'), 'dni' => '99887744',
            'rol_id' => 4, 'estado' => 'activo',
        ]);

        $userFinal = \App\Models\User::create([
            'nombres' => 'Finalizada', 'apellidos' => 'Smoke', 'name' => 'Finalizada Smoke',
            'email' => 'final.smoke@test.com', 'username' => 'final.smoke@test.com',
            'password' => bcrypt('secret123'), 'dni' => '99887733',
            'rol_id' => 4, 'estado' => 'activo',
        ]);

        \App\Models\AreaUsuario::create([
            'area_id' => $area->id, 'usuario_id' => $userActivo->id, 'cargo_id' => $cargo->id,
            'tipo_designacion' => 'Titular', 'usuario_designador_id' => $admin->id,
            'fecha_asignacion' => now(), 'fecha_inicio' => now(),
            'activo' => true, 'estado_asignacion' => 'activo',
        ]);

        \App\Models\AreaUsuario::create([
            'area_id' => $area->id, 'usuario_id' => $userFinal->id, 'cargo_id' => $cargo->id,
            'tipo_designacion' => 'Encargado', 'usuario_designador_id' => $admin->id,
            'fecha_asignacion' => now()->subDay(), 'fecha_inicio' => now()->subDay(),
            'fecha_fin' => now(), 'activo' => false, 'estado_asignacion' => 'finalizado',
        ]);

        $resp = $this->authJson('GET', '/api/v1/designaciones?search=Area SmokeDemo', $admin);
        $resp->assertStatus(200);
        $rows = $resp->json();
        $this->assertCount(1, $rows);
        $this->assertSame('activo', $rows[0]['estado_asignacion']);
        $this->assertSame('Activa', $rows[0]['usuario']['nombres']);
    }

    public function test_historial_responsables_excluye_pseudo_area_institucional(): void
    {
        [$admin, $area, $cargo] = $this->seedBase();

        $pseudo = \App\Models\User::create([
            'nombres' => 'Area SmokeDemo', 'apellidos' => '', 'name' => 'Area SmokeDemo',
            'email' => 'pseudo.smoke@test.com', 'username' => 'pseudo.smoke@test.com',
            'password' => bcrypt('secret123'), 'dni' => '90009999',
            'rol_id' => 3, 'estado' => 'activo', 'cargo' => 'Área Institucional',
        ]);

        $real = \App\Models\User::create([
            'nombres' => 'Real', 'apellidos' => 'Smoke', 'name' => 'Real Smoke',
            'email' => 'real.smoke@test.com', 'username' => 'real.smoke@test.com',
            'password' => bcrypt('secret123'), 'dni' => '99887711',
            'rol_id' => 4, 'estado' => 'activo',
        ]);

        \App\Models\AreaUsuario::create([
            'area_id' => $area->id, 'usuario_id' => $pseudo->id, 'cargo_id' => $cargo->id,
            'cargo' => 'Área Institucional', 'tipo_designacion' => 'titular',
            'usuario_designador_id' => $admin->id,
            'observaciones' => 'Asignado como encargado desde AreaEncargadoSeeder',
            'fecha_asignacion' => now(), 'fecha_inicio' => now(), 'fecha_fin' => now(),
            'activo' => false, 'estado_asignacion' => 'finalizado',
        ]);

        \App\Models\AreaUsuario::create([
            'area_id' => $area->id, 'usuario_id' => $real->id, 'cargo_id' => $cargo->id,
            'cargo' => $cargo->nombre, 'tipo_designacion' => 'Titular',
            'usuario_designador_id' => $admin->id,
            'fecha_asignacion' => now(), 'fecha_inicio' => now(),
            'activo' => true, 'estado_asignacion' => 'activo',
        ]);

        $resp = $this->authJson('GET', '/api/v1/areas/' . $area->id, $admin);
        $resp->assertStatus(200);

        $hist = $resp->json('historial_responsables');
        $this->assertCount(1, $hist);
        $this->assertSame('Real', $hist[0]['usuario']['nombres']);
        $this->assertSame('activo', $hist[0]['estado_asignacion']);

        $asigNombres = array_map(
            fn ($a) => $a['usuario']['nombres'],
            $resp->json('asignaciones')
        );
        $this->assertNotContains('Area SmokeDemo', $asigNombres);
        $this->assertNotContains('Asignado como encargado desde AreaEncargadoSeeder', array_column($resp->json('historial_responsables'), 'observaciones'));
    }

    public function test_historial_designaciones_excluye_pseudo_area_institucional(): void
    {
        [$admin, $area, $cargo] = $this->seedBase();

        $pseudo = \App\Models\User::create([
            'nombres' => 'Area SmokeDemo2', 'apellidos' => '', 'name' => 'Area SmokeDemo2',
            'email' => 'pseudo2.smoke@test.com', 'username' => 'pseudo2.smoke@test.com',
            'password' => bcrypt('secret123'), 'dni' => '90009998',
            'rol_id' => 3, 'estado' => 'activo', 'cargo' => 'Área Institucional',
        ]);

        \App\Models\AreaUsuario::create([
            'area_id' => $area->id, 'usuario_id' => $pseudo->id, 'cargo_id' => $cargo->id,
            'cargo' => 'Área Institucional', 'tipo_designacion' => 'titular',
            'usuario_designador_id' => $admin->id,
            'fecha_asignacion' => now(), 'fecha_inicio' => now(), 'fecha_fin' => now(),
            'activo' => false, 'estado_asignacion' => 'finalizado',
        ]);

        $resp = $this->authJson('GET', '/api/v1/designaciones/historial/' . $area->id, $admin);
        $resp->assertStatus(200);
        $this->assertCount(0, $resp->json());
    }

    public function test_area_update_password_crea_cuenta_institucional_si_no_existe(): void
    {
        [$admin, $area] = $this->seedBase(); // area sin usuario vinculado (caso Alcaldía)

        $resp = $this->authJson('PUT', '/api/v1/areas/' . $area->id, $admin, [
            'password_correo' => '12345678',
        ]);
        $resp->assertStatus(200);

        $user = \App\Models\User::whereRaw('LOWER(email) = LOWER(?)', [$area->correo])->first();
        $this->assertNotNull($user, 'Debe crear la cuenta institucional si no existía');
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('12345678', $user->password));
        $this->assertSame('activo', $user->estado);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $area->correo,
            'password' => '12345678',
        ]);
        $login->assertStatus(200);
        $this->assertNotEmpty($login->json('token'));
    }

    public function test_area_usuaria_institucional_sin_designaciones_ve_sus_bienes(): void
    {
        [$admin] = $this->seedBase();

        $tipoId = \DB::table('tipo_bienes')->insertGetId([
            'nombre' => 'Tipo SmokeBienes', 'icono' => null, 'estado' => 'activo',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $area = \App\Models\Area::create([
            'nombre' => 'Area InstBienes Smoke', 'correo' => 'inst.bienes.smoke@test.com', 'estado' => 'activo',
        ]);
        $sede = \App\Models\Sede::create(['nombre' => 'Sede InstBienes Smoke', 'estado' => 'activo']);

        \App\Models\Bien::create([
            'codigo' => 'SMOKE-INS-0001', 'tipo_bien_id' => $tipoId, 'area_id' => $area->id,
            'sede_id' => $sede->id, 'estado' => 'operativo', 'marca' => 'Logitech',
        ]);

        // Cuenta institucional SIN designaciones (caso Alcaldía)
        $user = \App\Models\User::create([
            'nombres' => 'InstBienes', 'apellidos' => 'Smoke', 'name' => 'InstBienes Smoke',
            'email' => 'inst.bienes.smoke@test.com', 'username' => 'inst.bienes.smoke@test.com',
            'password' => bcrypt('secret123'), 'dni' => '99887700',
            'rol_id' => 3, 'estado' => 'activo', 'cargo' => 'Área Institucional',
        ]);
        $this->assertSame(0, \App\Models\AreaUsuario::where('usuario_id', $user->id)->count());

        $resp = $this->authJson('GET', '/api/v1/bienes', $user);
        $resp->assertStatus(200);
        $this->assertContains('SMOKE-INS-0001', array_column($resp->json('data'), 'codigo'));

        $stats = $this->authJson('GET', '/api/v1/bienes/stats', $user);
        $stats->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, $stats->json('total'));

        $porArea = $this->authJson('GET', '/api/v1/bienes/por-area', $user);
        $porArea->assertStatus(200);
        $this->assertContains('Area InstBienes Smoke', array_column($porArea->json(), 'nombre'));

        $porSede = $this->authJson('GET', '/api/v1/bienes?sede_id=' . $sede->id, $user);
        $porSede->assertStatus(200);
        $this->assertContains('SMOKE-INS-0001', array_column($porSede->json('data'), 'codigo'));

        $otraSede = \App\Models\Sede::create(['nombre' => 'Sede Otra Smoke', 'estado' => 'activo']);
        $excluido = $this->authJson('GET', '/api/v1/bienes?sede_id=' . $otraSede->id, $user);
        $excluido->assertStatus(200);
        $this->assertNotContains('SMOKE-INS-0001', array_column($excluido->json('data'), 'codigo'));
    }

    public function test_sedes_crud_y_bien_requiere_sede(): void
    {
        [$admin, $area] = $this->seedBase();

        $list = $this->authJson('GET', '/api/v1/sedes', $admin);
        $list->assertStatus(200);

        $create = $this->authJson('POST', '/api/v1/sedes', $admin, [
            'nombre' => 'Sede CRUD Smoke', 'direccion' => 'Jr. Test 123', 'estado' => 'activo',
        ]);
        $create->assertStatus(201);
        $sedeId = $create->json('data.id');

        $update = $this->authJson('PUT', "/api/v1/sedes/{$sedeId}", $admin, [
            'direccion' => 'Av. Modificada 456',
        ]);
        $update->assertStatus(200);
        $this->assertSame('Av. Modificada 456', $update->json('data.direccion'));

        $tipoId = \DB::table('tipo_bienes')->insertGetId([
            'nombre' => 'Tipo SmokeSede', 'icono' => null, 'estado' => 'activo',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $sinSede = $this->authJson('POST', '/api/v1/bienes', $admin, [
            'tipo_bien_id' => $tipoId, 'area_id' => $area->id, 'estado' => 'operativo', 'marca' => 'MarcaX',
        ]);
        $sinSede->assertStatus(422);
        $this->assertArrayHasKey('sede_id', $sinSede->json('errors'));

        $conSede = $this->authJson('POST', '/api/v1/bienes', $admin, [
            'tipo_bien_id' => $tipoId, 'area_id' => $area->id, 'sede_id' => $sedeId,
            'estado' => 'operativo', 'marca' => 'MarcaX',
        ]);
        $conSede->assertStatus(201);
        $this->assertSame($sedeId, $conSede->json('data.sede.id'));

        $delConBienes = $this->authJson('DELETE', "/api/v1/sedes/{$sedeId}", $admin);
        $delConBienes->assertStatus(400);

        $otra = $this->authJson('POST', '/api/v1/sedes', $admin, ['nombre' => 'Sede Vacia Smoke']);
        $otra->assertStatus(201);
        $delVacia = $this->authJson('DELETE', '/api/v1/sedes/' . $otra->json('data.id'), $admin);
        $delVacia->assertStatus(200);
    }

    public function test_area_usuaria_puede_ver_su_ticket_completo(): void
    {
        [$admin, $area] = $this->seedBase();

        // Cuenta institucional del área (email = correo del área)
        $user = \App\Models\User::create([
            'nombres' => 'Area SmokeDemo', 'apellidos' => '', 'name' => 'Area SmokeDemo',
            'email' => $area->correo, 'username' => $area->correo,
            'password' => bcrypt('secret123'), 'dni' => '99887699',
            'rol_id' => 3, 'estado' => 'activo', 'cargo' => 'Área Institucional',
        ]);

        $ticket = \App\Models\Ticket::create([
            'numero' => 'TKT-2026-990001',
            'titulo' => 'Ticket smoke area usuaria',
            'descripcion' => 'Descripcion smoke',
            'categoria' => 'hardware',
            'area_id' => $area->id,
            'creado_por' => $user->id,
            'estado' => 'pendiente',
        ]);

        $list = $this->authJson('GET', '/api/v1/tickets', $user);
        $list->assertStatus(200);
        $this->assertContains($ticket->id, array_column($list->json('data'), 'id'));

        $this->authJson('GET', '/api/v1/tickets/' . $ticket->id, $user)->assertStatus(200);
        $this->authJson('GET', '/api/v1/tickets/' . $ticket->id . '/historial', $user)->assertStatus(200);
        $this->authJson('GET', '/api/v1/tickets/' . $ticket->id . '/respuestas', $user)->assertStatus(200);
        $this->authJson('GET', '/api/v1/tickets/stats', $user)->assertStatus(200);
    }
}

