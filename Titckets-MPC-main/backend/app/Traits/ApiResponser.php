<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponser
{
    public function success($data, string $message = 'OK', int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    public function error(string $message = 'Error', int $code = 400): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $code);
    }

    public function created($data, string $message = 'Recurso creado'): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ], 201);
    }

    public function notFound(string $message = 'Recurso no encontrado'): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], 404);
    }

    public function forbidden(string $message = 'No autorizado'): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], 403);
    }

    public function unauthorized(string $message = 'No autenticado'): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], 401);
    }
}
