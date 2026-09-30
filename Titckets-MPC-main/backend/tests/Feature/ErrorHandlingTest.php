<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ErrorHandlingTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        if (!\Schema::hasTable('tickets') || !\Schema::hasTable('roles')) {
            $this->markTestSkipped('Requiere base de datos migrada (MySQL). Ejecutar con DB_CONNECTION=mysql.');
        }
    }

    private function admin(): \App\Models\User
    {
        $admin = \App\Models\User::where('rol_id', 1)->first();
        if (!$admin) {
            $admin = \App\Models\User::create([
                'nombres' => 'Admin', 'apellidos' => 'ErrorTest', 'name' => 'Admin ErrorTest',
                'email' => 'admin.errortest@test.com', 'username' => 'admin.errortest@test.com',
                'password' => bcrypt('secret123'), 'dni' => '99887766',
                'rol_id' => 1, 'estado' => 'activo',
            ]);
        }

        return $admin;
    }

    private function assertErrorStructure($resp, int $status, string $errorCode): void
    {
        $resp->assertStatus($status);
        $resp->assertJson([
            'success' => false,
            'error_code' => $errorCode,
        ]);
        $this->assertMatchesRegularExpression('/^REQ-\d{8}-[A-F0-9]{6}$/', $resp->json('request_id'), 'Debe incluir request_id');
        $this->assertSame($resp->json('request_id'), $resp->headers->get('X-Request-Id'), 'Header X-Request-Id debe coincidir con request_id');
    }

    public function test_respuesta_exitosa_incluye_request_id(): void
    {
        $resp = $this->getJson('/api/v1/settings');
        $resp->assertStatus(200);
        $this->assertMatchesRegularExpression('/^REQ-\d{8}-[A-F0-9]{6}$/', $resp->headers->get('X-Request-Id'));
    }

    public function test_401_sin_token(): void
    {
        $resp = $this->getJson('/api/v1/tickets');
        $this->assertErrorStructure($resp, 401, 'AUTH_UNAUTHORIZED');
        $this->assertSame('No has iniciado sesión. Inicia sesión para continuar.', $resp->json('message'));
    }

    public function test_401_token_invalido(): void
    {
        $resp = $this->withHeader('Authorization', 'Bearer token-basura-invalido')->getJson('/api/v1/tickets');
        $resp->assertStatus(401);
        $this->assertContains($resp->json('error_code'), ['AUTH_UNAUTHORIZED', 'AUTH_TOKEN_INVALID']);
        $this->assertStringNotContainsString('token-basura-invalido', $resp->json('message'));
    }

    public function test_401_token_expirado(): void
    {
        $admin = $this->admin();

        // Token firmado con el secreto real pero con exp en el pasado
        $b64 = fn (string $data) => rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
        $now = time();
        $header = $b64(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $body = $b64(json_encode([
            'iss' => config('jwt.issuer'),
            'iat' => $now - 7200,
            'exp' => $now - 3600,
            'nbf' => $now - 7200,
            'sub' => $admin->id,
            'jti' => (string) \Illuminate\Support\Str::uuid(),
        ]));
        $signature = $b64(hash_hmac('sha256', "{$header}.{$body}", config('jwt.secret'), true));
        $token = "{$header}.{$body}.{$signature}";

        $resp = $this->withHeader('Authorization', 'Bearer ' . $token)->getJson('/api/v1/tickets');
        $this->assertErrorStructure($resp, 401, 'AUTH_SESSION_EXPIRED');
        $this->assertSame('Tu sesión ha expirado. Vuelve a iniciar sesión.', $resp->json('message'));
    }

    public function test_403_sin_permiso(): void
    {
        $user = \App\Models\User::create([
            'nombres' => 'SinPermiso', 'apellidos' => 'ErrorTest', 'name' => 'SinPermiso ErrorTest',
            'email' => 'sinpermiso.errortest@test.com', 'username' => 'sinpermiso.errortest@test.com',
            'password' => bcrypt('secret123'), 'dni' => '99887765',
            'rol_id' => 4, 'estado' => 'activo',
        ]);
        $token = auth('api')->login($user);

        $resp = $this->withHeader('Authorization', 'Bearer ' . $token)->getJson('/api/v1/sedes');
        $this->assertErrorStructure($resp, 403, 'AUTH_FORBIDDEN');
        $this->assertSame('No tienes permisos para realizar esta acción.', $resp->json('message'));
    }

    public function test_404_no_expone_modelos_ni_consultas(): void
    {
        $admin = $this->admin();
        $token = auth('api')->login($admin);

        $resp = $this->withHeader('Authorization', 'Bearer ' . $token)->getJson('/api/v1/bienes/999999');
        $this->assertErrorStructure($resp, 404, 'ASSET_NOT_FOUND');
        $this->assertSame('El recurso solicitado no existe o ya no está disponible.', $resp->json('message'));

        $message = $resp->json('message');
        foreach (['Bien', 'Model', 'query results', 'App\\'] as $leak) {
            $this->assertStringNotContainsString($leak, $message, "El mensaje no debe exponer: {$leak}");
        }

        $ticket = $this->withHeader('Authorization', 'Bearer ' . $token)->getJson('/api/v1/tickets/999999');
        $this->assertErrorStructure($ticket, 404, 'TICKET_NOT_FOUND');
    }

    public function test_422_validacion_en_espanol(): void
    {
        $admin = $this->admin();
        $token = auth('api')->login($admin);

        $resp = $this->withHeader('Authorization', 'Bearer ' . $token)->postJson('/api/v1/cargos', []);
        $this->assertErrorStructure($resp, 422, 'VALIDATION_ERROR');
        $this->assertSame('Revisa los datos ingresados.', $resp->json('message'));
        $this->assertArrayHasKey('nombre', $resp->json('errors'));
        $this->assertStringContainsString('obligatorio', $resp->json('errors.nombre.0'));
    }

    public function test_429_limite_de_solicitudes(): void
    {
        RateLimiter::clear('login:127.0.0.1');

        $resp = null;
        for ($i = 0; $i < 6; $i++) {
            $resp = $this->postJson('/api/v1/auth/login', [
                'email' => 'no.existe@test.com',
                'password' => 'incorrecta',
            ]);
        }

        $this->assertErrorStructure($resp, 429, 'RATE_LIMITED');
        $this->assertSame(
            'Se han realizado demasiadas solicitudes. Espera unos segundos e inténtalo nuevamente.',
            $resp->json('message')
        );

        RateLimiter::clear('login:127.0.0.1');
    }

    public function test_500_estructurado_sin_fuga_de_informacion_en_produccion(): void
    {
        Route::get('/api/v1/_error-test', function () {
            throw new \RuntimeException('Fallo interno con detalle secreto del servidor');
        });

        config(['app.debug' => false]);

        $resp = $this->getJson('/api/v1/_error-test');
        $this->assertErrorStructure($resp, 500, 'INTERNAL_SERVER_ERROR');
        $this->assertSame('Se produjo un error inesperado. El equipo de OTIC puede revisar el incidente.', $resp->json('message'));

        $body = $resp->getContent();
        foreach (['Fallo interno con detalle', 'RuntimeException', 'Exception', 'vendor', 'trace'] as $leak) {
            $this->assertStringNotContainsString($leak, $body, "La respuesta no debe exponer: {$leak}");
        }
    }

    public function test_login_fallido_es_estructurado_y_no_delata_cuentas(): void
    {
        $resp = $this->postJson('/api/v1/auth/login', [
            'email' => 'usuario.inexistente@test.com',
            'password' => 'cualquiera',
        ]);
        $this->assertErrorStructure($resp, 401, 'AUTH_INVALID_CREDENTIALS');
        $this->assertStringContainsString('Credenciales incorrectas', $resp->json('message'));
    }
}
