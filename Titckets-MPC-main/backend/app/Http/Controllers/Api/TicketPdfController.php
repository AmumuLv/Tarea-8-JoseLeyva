<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class TicketPdfController extends Controller
{
    public function generate(Request $request, $id)
    {
        $ticket = Ticket::with([
            'createdBy',
            'assignedTo',
            'area.jefe',
            'historial.usuario',
            'evidencias',
            'respuestas.usuario',
        ])->findOrFail($id);

        $historial = $ticket->historial->sortBy('created_at');
        $evidencias = $ticket->evidencias;

        $logoPath = public_path('uploads/settings/logo.jpg');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/jpeg;base64,' . base64_encode($logoData);
        }

        $data = [
            'ticket' => $ticket,
            'historial' => $historial,
            'evidencias' => $evidencias,
            'generatedAt' => now()->format('d/m/Y h:i:s A'),
            'generatedBy' => auth()->user()->name ?? 'Sistema',
            'logoBase64' => $logoBase64,
        ];

        $pdf = Pdf::loadView('pdf.ticket-reporte', $data)
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

        $filename = 'REPORTE_TICKET_' . $ticket->numero . '.pdf';

        return $pdf->download($filename);
    }
}
