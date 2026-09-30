<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RequestContext
{
    /**
     * Asigna un identificador único a la solicitud y lo adjunta al contexto
     * de logging (request_id, usuario, endpoint, IP) y a la respuesta.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = 'REQ-' . now()->format('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $request->attributes->set('request_id', $requestId);

        Log::withContext([
            'request_id' => $requestId,
            'method' => $request->method(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_id' => self::userId($request),
        ]);

        $response = $next($request);

        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }

    protected static function userId(Request $request): ?int
    {
        try {
            return $request->user()?->id;
        } catch (\Throwable) {
            return null;
        }
    }
}
