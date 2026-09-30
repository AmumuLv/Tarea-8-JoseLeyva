<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DniController extends Controller
{
    public function lookup(Request $request)
    {
        $request->validate([
            'dni' => 'required|string|size:8',
        ]);

        try {
            $response = Http::timeout(10)->withoutVerifying()->get(
                'https://ww1.sunat.gob.pe/ol-ti-itfisdenreg/itfisdenreg.htm',
                [
                    'accion' => 'obtenerDatosDni',
                    'numDocumento' => $request->dni,
                ]
            );

            if ($response->failed()) {
                return response()->json(['message' => 'Error al consultar DNI'], 500);
            }

            $data = $response->json();

            if (isset($data['message']) && $data['message'] === 'success' && !empty($data['lista'])) {
                $fullName = $data['lista'][0]['nombresapellidos'] ?? '';
                $parts = explode(',', $fullName);
                $apellidos = trim($parts[0] ?? '');
                $nombres = trim($parts[1] ?? '');

                return response()->json([
                    'success' => true,
                    'nombres' => $nombres,
                    'apellidos' => $apellidos,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'DNI no encontrado',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al consultar DNI: ' . $e->getMessage(),
            ], 500);
        }
    }
}
