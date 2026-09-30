<?php

use App\Helpers\ApiError;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Tymon\JWTAuth\Exceptions\InvalidClaimException;
use Tymon\JWTAuth\Exceptions\PayloadException;
use Tymon\JWTAuth\Exceptions\TokenBlacklistedException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(\App\Http\Middleware\RequestContext::class);

        $middleware->alias([
            'jwt' => \Tymon\JWTAuth\Http\Middleware\Authenticate::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // El request_id también debe acompañar las respuestas de error
        // (el middleware no llega a ejecutar su tramo final cuando hay excepción).
        $exceptions->respond(function ($response, $e, Request $request): mixed {
            $requestId = $request->attributes->get('request_id');
            if ($requestId) {
                $response->headers->set('X-Request-Id', $requestId);
            }

            return $response;
        });

        // 404 — nunca exponer modelos ni rutas internas
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            return ApiError::response(
                $request,
                404,
                'El recurso solicitado no existe o ya no está disponible.',
                ApiError::errorCodeFor($request, 404)
            );
        });

        // 401 — JWT (token ausente, expirado, inválido o en blacklist)
        $exceptions->render(function (UnauthorizedHttpException $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            [$message, $code] = match (true) {
                $e->getPrevious() instanceof TokenExpiredException,
                $e->getPrevious() instanceof TokenBlacklistedException =>
                    ['Tu sesión ha expirado. Vuelve a iniciar sesión.', 'AUTH_SESSION_EXPIRED'],
                $e->getPrevious() instanceof TokenInvalidException,
                $e->getPrevious() instanceof InvalidClaimException,
                $e->getPrevious() instanceof PayloadException =>
                    ['Tu sesión no es válida. Vuelve a iniciar sesión.', 'AUTH_TOKEN_INVALID'],
                default => ['No has iniciado sesión. Inicia sesión para continuar.', 'AUTH_UNAUTHORIZED'],
            };

            return ApiError::response($request, 401, $message, $code);
        });

        // 401 — autenticación de Laravel
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            return ApiError::response($request, 401, 'No has iniciado sesión. Inicia sesión para continuar.', 'AUTH_UNAUTHORIZED');
        });

        // 429 — límite de solicitudes
        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            return ApiError::response(
                $request,
                429,
                'Se han realizado demasiadas solicitudes. Espera unos segundos e inténtalo nuevamente.',
                'RATE_LIMITED'
            );
        });

        // 422 — validación de datos
        $exceptions->render(function (ValidationException $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            $prepared = ApiError::prepareValidation($e);

            return ApiError::response($request, 422, 'Revisa los datos ingresados.', $prepared['code'], $prepared['errors']);
        });

        // 400/403/405/419 y abort(...) — cualquier excepción HTTP restante
        $exceptions->render(function (HttpException $e, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            $status = $e->getStatusCode();
            [$message, $code] = match ($status) {
                403 => ['No tienes permisos para realizar esta acción.', 'AUTH_FORBIDDEN'],
                405 => ['Método de solicitud no permitido.', 'METHOD_NOT_ALLOWED'],
                419 => ['Tu sesión ha caducado. Vuelve a iniciar sesión.', 'AUTH_SESSION_EXPIRED'],
                422 => [$e->getMessage() ?: 'Revisa los datos ingresados.', 'VALIDATION_ERROR'],
                default => [$e->getMessage() ?: 'La solicitud no pudo procesarse.', "HTTP_{$status}"],
            };

            return ApiError::response($request, $status, $message, $code);
        });

        // 500 — último recurso, solo API (la web conserva el manejo por defecto)
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (!$request->is('api/*') || $e instanceof HttpResponseException) {
                return null;
            }

            $code = $e instanceof \Illuminate\Database\QueryException
                ? 'DATABASE_ERROR'
                : ApiError::errorCodeFor($request, 500);

            $response = ApiError::response(
                $request,
                500,
                'Se produjo un error inesperado. El equipo de OTIC puede revisar el incidente.',
                $code
            );

            if (config('app.debug')) {
                $response->setData(array_merge($response->getData(true), [
                    'exception' => get_class($e),
                    'exception_message' => $e->getMessage(),
                    'file' => $e->getFile() . ':' . $e->getLine(),
                ]));
            }

            return $response;
        });
    })->create();
