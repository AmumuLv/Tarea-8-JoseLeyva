<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Models\Bien;
use Barryvdh\DomPDF\Facade\Pdf;

class AreaPdfController extends Controller
{
    public function generate($id)
    {
        // Excluir usuarios pseudo "Área Institucional" del historial y asignaciones
        $soloPersonalReal = fn ($q) => $q->whereDoesntHave('usuario', fn ($qq) => $qq->where('cargo', 'Área Institucional'));

        $area = Area::with([
            'jefeActual.usuario',
            'tickets.createdBy',
            'tickets.assignedTo',
            'historialResponsables' => $soloPersonalReal,
            'historialResponsables.usuario',
            'asignaciones' => $soloPersonalReal,
            'asignaciones.usuario',
        ])->withCount('tickets')->findOrFail($id);

        $tickets = $area->tickets->sortByDesc('created_at')->values();

        $bienes = Bien::with(['tipoBien', 'sede'])
            ->where('area_id', $area->id)
            ->orderBy('codigo')
            ->get();

        $esCerrado = fn ($t) => in_array(strtolower($t->estado), ['cerrado', 'cancelado']);

        $ticketStats = [
            'total' => $tickets->count(),
            'activos' => $tickets->filter(fn ($t) => !$esCerrado($t))->count(),
            'cerrados' => $tickets->filter(fn ($t) => strtolower($t->estado) === 'cerrado')->count(),
            'cancelados' => $tickets->filter(fn ($t) => strtolower($t->estado) === 'cancelado')->count(),
        ];

        $bienStats = [
            'total' => $bienes->count(),
            'operativos' => $bienes->filter(fn ($b) => $b->estado === 'operativo')->count(),
            'mantenimiento' => $bienes->filter(fn ($b) => $b->estado === 'mantenimiento')->count(),
            'fuera' => $bienes->filter(fn ($b) => in_array($b->estado, ['inactivo', 'baja']))->count(),
        ];

        $responsable = $area->jefeActual?->usuario
            ?? $area->asignaciones->firstWhere('estado_asignacion', 'activo')?->usuario;

        $logoPath = public_path('uploads/settings/logo.jpg');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoBase64 = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($logoPath));
        }

        $data = [
            'area' => $area,
            'responsable' => $responsable,
            'responsableAsignacion' => $area->jefeActual,
            'tickets' => $tickets,
            'bienes' => $bienes,
            'ticketStats' => $ticketStats,
            'bienStats' => $bienStats,
            'generatedAt' => now()->format('d/m/Y h:i:s A'),
            'generatedBy' => auth()->user()->name ?? auth()->user()->full_name ?? 'Sistema',
            'logoBase64' => $logoBase64,
        ];

        $pdf = Pdf::loadView('pdf.area-reporte', $data)
            ->setPaper('a4', 'portrait')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isFontSubsettingEnabled', true)
            ->setOption('defaultFont', 'Helvetica')
            ->setOption('dpi', 150)
            ->setOption('margin_left', 28)
            ->setOption('margin_right', 28)
            ->setOption('margin_top', 25)
            ->setOption('margin_bottom', 25)
            ->setOption('tempDir', sys_get_temp_dir());

        $nombreLimpio = preg_replace('/[^A-Za-z0-9]+/', '_', \Illuminate\Support\Str::ascii($area->nombre));
        $filename = 'REPORTE_AREA_' . trim($nombreLimpio, '_') . '.pdf';

        return $pdf->download($filename);
    }
}
