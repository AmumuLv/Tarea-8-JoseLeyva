<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permiso;
use Illuminate\Http\JsonResponse;

class PermisoController extends Controller
{
    public function index(): JsonResponse
    {
        $permisos = Permiso::orderBy('modulo')->orderBy('nombre')->get()->groupBy('modulo');

        return response()->json($permisos);
    }
}
