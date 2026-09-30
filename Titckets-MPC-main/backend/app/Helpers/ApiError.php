<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ApiError
{
    /**
     * Primer segmento del URI (después de api/v1) → prefijo de código interno.
     */
    protected const MODULES = [
        'tickets' => 'TICKET',
        'areas' => 'AREA',
        'area-profile' => 'AREA',
        'usuarios' => 'USER',
        'tecnicos' => 'TECHNICIAN',
        'bienes' => 'ASSET',
        'tipos-bienes' => 'ASSET_TYPE',
        'sedes' => 'SEDE',
        'cargos' => 'CARGO',
        'designaciones' => 'DESIGNACION',
        'auditoria' => 'AUDIT',
        'dashboard' => 'DASHBOARD',
        'auth' => 'AUTH',
        'dni' => 'USER',
        'permisos' => 'PERMISSION',
        'roles' => 'ROLE',
        'settings' => 'SETTINGS',
    ];

    /**
     * Respuesta JSON estructurada de error (extremo a extremo).
     */
    public static function response(Request $request, int $status, string $message, string $errorCode, array $errors = []): JsonResponse
    {
        if ($status >= 400 && $status < 500) {
            Log::warning('api_error', [
                'status' => $status,
                'error_code' => $errorCode,
                'message' => $message,
            ]);
        }

        $response = response()->json([
            'success' => false,
            'message' => $message,
            'error_code' => $errorCode,
            'errors' => (object) $errors,
            'request_id' => self::requestId($request),
        ], $status);

        if ($requestId = self::requestId($request)) {
            $response->headers->set('X-Request-Id', $requestId);
        }

        return $response;
    }

    public static function requestId(Request $request): ?string
    {
        return $request->attributes->get('request_id');
    }

    /**
     * Deriva el código interno a partir del estado HTTP y del recurso invocado.
     */
    public static function errorCodeFor(Request $request, int $status): string
    {
        $module = self::module($request);

        return match ($status) {
            401 => 'AUTH_UNAUTHORIZED',
            403 => 'AUTH_FORBIDDEN',
            404 => $module ? "{$module}_NOT_FOUND" : 'RESOURCE_NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            419 => 'AUTH_SESSION_EXPIRED',
            422 => 'VALIDATION_ERROR',
            429 => 'RATE_LIMITED',
            503 => 'SERVICE_UNAVAILABLE',
            default => $status >= 500 ? self::failureCode($request, $module) : "HTTP_{$status}",
        };
    }

    /**
     * Prepara código interno y mensajes de validación, detectando errores de archivos.
     *
     * @return array{code: string, errors: array<string, array<int, string>>}
     */
    public static function prepareValidation(ValidationException $e): array
    {
        $errors = $e->errors();
        $code = 'VALIDATION_ERROR';

        foreach ($errors as $field => $messages) {
            $rules = array_map(
                fn ($rule) => is_string($rule) ? strtolower(explode(':', $rule)[0]) : strtolower(class_basename($rule)),
                $e->validator->getRules()[$field] ?? []
            );

            $isFile = (bool) array_intersect($rules, ['file', 'image', 'mimes', 'mimetypes', 'extension']);
            if (!$isFile) {
                continue;
            }

            if (in_array('max', $rules, true)) {
                $code = 'FILE_TOO_LARGE';
                $errors[$field] = ['El archivo supera el tamaño máximo permitido.'];
                break;
            }

            if (array_intersect($rules, ['mimes', 'mimetypes', 'extension'])) {
                $code = 'FILE_TYPE_NOT_ALLOWED';
                $errors[$field] = ['El tipo de archivo no está permitido.'];
            }
        }

        return ['code' => $code, 'errors' => $errors];
    }

    protected static function failureCode(Request $request, ?string $module): string
    {
        $suffix = match ($request->method()) {
            'POST' => 'CREATE_FAILED',
            'PUT', 'PATCH' => 'UPDATE_FAILED',
            'DELETE' => 'DELETE_FAILED',
            default => null,
        };

        if ($suffix && $module) {
            return "{$module}_{$suffix}";
        }

        return 'INTERNAL_SERVER_ERROR';
    }

    protected static function module(Request $request): ?string
    {
        $segments = $request->segments();
        $index = array_search('v1', $segments, true);
        $name = strtolower($segments[$index + 1] ?? '');

        return self::MODULES[$name] ?? null;
    }
}
