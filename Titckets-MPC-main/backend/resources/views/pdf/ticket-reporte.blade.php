<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
@page { size: A4; margin: 22mm 25mm; }
* { margin: 0; padding: 0; }
body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 9px; color: #1e293b; line-height: 1.4; }

.wrap { width: 100%; }

/* HEADER */
.hdr { width: 100%; overflow: hidden; border-bottom: 3px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 14px; }
.hdr-l { float: left; width: 65%; }
.hdr-r { float: right; width: 35%; text-align: right; }
.hdr-logo { float: left; margin-right: 10px; }
.hdr-logo img { width: 44px; height: 44px; display: block; }
.hdr-logo-div { width: 44px; height: 44px; background: #1e3a8a; color: #fff; font-size: 18px; font-weight: bold; text-align: center; line-height: 44px; }
.hdr-txt { overflow: hidden; padding-top: 6px; }
.hdr-muni { font-size: 12px; font-weight: bold; color: #1e3a8a; }
.hdr-otic { font-size: 7.5px; color: #64748b; margin-top: 1px; }
.hdr-ticket { font-size: 18px; font-weight: bold; color: #1e3a8a; }
.hdr-fecha { font-size: 7px; color: #94a3b8; margin-top: 2px; }

/* TITLE */
.titulo { text-align: center; padding: 8px 0 12px 0; }
.titulo h1 { font-size: 13px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1.5px; }
.titulo p { font-size: 7.5px; color: #64748b; margin-top: 3px; }

/* SECTION */
.sec { margin-bottom: 12px; }
.sec-t { font-size: 9.5px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.4px; padding-bottom: 3px; border-bottom: 2px solid #dbeafe; margin-bottom: 8px; }

/* CARD */
.crd { border: 1px solid #e2e8f0; background: #fff; margin-bottom: 6px; overflow: hidden; }
.crd-h { background: #f1f5f9; padding: 4px 8px; border-bottom: 1px solid #e2e8f0; font-size: 7px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.3px; }
.crd-b { padding: 6px 8px; }
.crd-r { margin-bottom: 3px; overflow: hidden; }
.crd-r:last-child { margin-bottom: 0; }
.crd-lb { font-size: 6.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2px; font-weight: 600; }
.crd-v { font-size: 9px; font-weight: 700; color: #1e293b; }

/* FLOAT GRID */
.row { overflow: hidden; margin-bottom: 6px; }
.row::after { content: ""; display: table; clear: both; }
.c4 { float: left; width: 24%; margin-right: 1.33%; }
.c4:last-child { margin-right: 0; }
.c3 { float: left; width: 32%; margin-right: 2%; }
.c3:last-child { margin-right: 0; }
.c2 { float: left; width: 48.5%; margin-right: 3%; }
.c2:last-child { margin-right: 0; }

/* BADGE */
.bg { display: inline-block; padding: 2px 7px; font-size: 8px; font-weight: 700; }
.bg-abierto { background: #dbeafe; color: #1e40af; }
.bg-en_proceso { background: #fef3c7; color: #92400e; }
.bg-en_espera { background: #fef3c7; color: #92400e; }
.bg-asignado { background: #e0e7ff; color: #3730a3; }
.bg-cerrado { background: #dcfce7; color: #166534; }
.bg-cancelado { background: #fee2e2; color: #991b1b; }
.bg-critico { background: #fee2e2; color: #991b1b; }
.bg-alta { background: #ffedd5; color: #9a3412; }
.bg-media { background: #fef9c3; color: #854d0e; }
.bg-baja { background: #f0fdf4; color: #166534; }

/* DESC */
.desc { border: 1px solid #e2e8f0; background: #f8fafc; padding: 8px 10px; font-size: 9px; color: #334155; line-height: 1.5; }

/* SUMMARY */
.srow { overflow: hidden; margin-bottom: 6px; }
.srow::after { content: ""; display: table; clear: both; }
.sc { float: left; width: 23.5%; margin-right: 2%; text-align: center; background: #eff6ff; border: 1px solid #bfdbfe; padding: 7px 3px; }
.sc:last-child { margin-right: 0; }
.sc-lb { font-size: 7px; color: #3b82f6; text-transform: uppercase; font-weight: 700; letter-spacing: 0.2px; }
.sc-v { font-size: 15px; font-weight: bold; color: #1e3a8a; margin-top: 2px; }
.sc-vs { font-size: 9px; font-weight: bold; color: #1e3a8a; margin-top: 2px; }

/* TABLE */
.dtbl { width: 100%; border-collapse: collapse; font-size: 8px; }
.dtbl th { background: #1e3a8a; color: #fff; padding: 5px 7px; text-align: left; font-weight: 600; font-size: 7px; text-transform: uppercase; letter-spacing: 0.2px; }
.dtbl td { padding: 5px 7px; border-bottom: 1px solid #e2e8f0; }
.dtbl tr:nth-child(even) td { background: #f8fafc; }

/* RESULT */
.res { border: 2px solid #1e3a8a; background: #f0f9ff; padding: 8px 10px; }
.res-t { font-size: 9px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; margin-bottom: 3px; }
.res-tx { font-size: 9px; color: #334155; line-height: 1.4; }

/* SIG */
.sig-row { overflow: hidden; margin-top: 16px; }
.sig-row::after { content: ""; display: table; clear: both; }
.sig-c { float: left; width: 30%; text-align: center; margin-right: 5%; }
.sig-c:last-child { margin-right: 0; }
.sig-ln { border-top: 1px solid #475569; padding-top: 3px; margin-top: 32px; }
.sig-nm { font-size: 9px; font-weight: 700; color: #1e293b; }
.sig-rl { font-size: 7px; color: #64748b; margin-top: 1px; }

/* FOOTER */
.ftr { border-top: 2px solid #1e3a8a; margin-top: 14px; padding-top: 6px; overflow: hidden; }
.ftr::after { content: ""; display: table; clear: both; }
.ftr-l { float: left; width: 50%; }
.ftr-r { float: right; width: 50%; text-align: right; }
.ftr-t { font-size: 7px; color: #64748b; line-height: 1.3; }
.ftr-t strong { color: #1e293b; }
</style>
</head>
<body>
<div class="wrap">

<!-- ========== HEADER ========== -->
<div class="hdr">
  <div class="hdr-l">
    <div class="hdr-logo">
      @if($logoBase64)<img src="{{ $logoBase64 }}" />@else<div class="hdr-logo-div">M</div>@endif
    </div>
    <div class="hdr-txt">
      <div class="hdr-muni">Municipalidad Provincial de Casma</div>
      <div class="hdr-otic">Oficina de Tecnolog&iacute;as de la Informaci&oacute;n y Comunicaciones</div>
    </div>
  </div>
  <div class="hdr-r">
    <div class="hdr-ticket">{{ $ticket->numero }}</div>
    <div class="hdr-fecha">{{ $generatedAt }}</div>
  </div>
</div>

<!-- ========== TITLE ========== -->
<div class="titulo">
  <h1>Reporte de Atenci&oacute;n de Ticket</h1>
  <p>Documento generado autom&aacute;ticamente por el Sistema de Mesa de Ayuda</p>
</div>

<!-- ========== INFORMACION GENERAL ========== -->
@php
  $estadoMap = [
    'abierto' => ['bg-abierto', 'Abierto'],
    'en_proceso' => ['bg-en-proceso', 'En Proceso'],
    'en_espera' => ['bg-en_espera', 'En Espera'],
    'asignado' => ['bg-asignado', 'Asignado'],
    'cerrado' => ['bg-cerrado', 'Cerrado'],
    'cancelado' => ['bg-cancelado', 'Cancelado'],
  ];
  $est = $estadoMap[strtolower($ticket->estado)] ?? ['bg-abierto', ucfirst($ticket->estado)];
  $prioMap = [
    'critica' => ['bg-critico', 'Cr&iacute;tica'],
    'alta' => ['bg-alta', 'Alta'],
    'media' => ['bg-media', 'Media'],
    'baja' => ['bg-baja', 'Baja'],
  ];
  $pr = $prioMap[strtolower($ticket->prioridad)] ?? ['bg-media', ucfirst($ticket->prioridad)];
@endphp

<div class="sec">
  <div class="sec-t">Informaci&oacute;n General</div>
  <!-- Fila 1 -->
  <div class="row">
    <div class="c4">
      <div class="crd"><div class="crd-h">Estado</div><div class="crd-b"><span class="bg {{ $est[0] }}">{{ $est[1] }}</span></div></div>
    </div>
    <div class="c4">
      <div class="crd"><div class="crd-h">Prioridad</div><div class="crd-b"><span class="bg {{ $pr[0] }}">{{ $pr[1] }}</span></div></div>
    </div>
    <div class="c4">
      <div class="crd"><div class="crd-h">Categor&iacute;a</div><div class="crd-b"><div class="crd-v">{{ ucfirst($ticket->categoria ?? 'N/A') }}</div></div></div>
    </div>
    <div class="c4">
      <div class="crd"><div class="crd-h">Tipo Incidencia</div><div class="crd-b"><div class="crd-v">{{ $ticket->tipo_incidencia ?? 'N/A' }}</div></div></div>
    </div>
  </div>
  <!-- Fila 2 -->
  <div class="row">
    <div class="c3">
      <div class="crd"><div class="crd-h">Fecha Creaci&oacute;n</div><div class="crd-b"><div class="crd-v">{{ $ticket->created_at ? $ticket->created_at->format('d/m/Y h:i A') : 'N/A' }}</div></div></div>
    </div>
    <div class="c3">
      <div class="crd"><div class="crd-h">Fecha Cierre</div><div class="crd-b"><div class="crd-v">{{ $ticket->fecha_cierre ? \Carbon\Carbon::parse($ticket->fecha_cierre)->format('d/m/Y h:i A') : 'Pendiente' }}</div></div></div>
    </div>
    <div class="c3">
      <div class="crd"><div class="crd-h">Tiempo de Atenci&oacute;n</div><div class="crd-b"><div class="crd-v">
        @if($ticket->fecha_cierre && $ticket->created_at){{ $ticket->created_at->diff(\Carbon\Carbon::parse($ticket->fecha_cierre))->format('%dh %Im') }}@else En curso @endif
      </div></div></div>
    </div>
  </div>
</div>

<!-- ========== AREA + TECNICO ========== -->
<div class="sec">
  <div class="sec-t">&Aacute;rea Solicitante y T&eacute;cnico Asignado</div>
  <div class="row">
    <div class="c2">
      <div class="crd">
        <div class="crd-h">&Aacute;rea Solicitante</div>
        <div class="crd-b">
          <div class="crd-r"><div class="crd-lb">&Aacute;rea</div><div class="crd-v">{{ $ticket->area->nombre ?? 'No especificada' }}</div></div>
          <div class="crd-r"><div class="crd-lb">Responsable</div><div class="crd-v">{{ $ticket->area->jefe->name ?? 'No asignado' }}</div></div>
          <div class="crd-r"><div class="crd-lb">Correo Institucional</div><div class="crd-v">{{ $ticket->area->correo ?? 'N/A' }}</div></div>
        </div>
      </div>
    </div>
    <div class="c2">
      <div class="crd">
        <div class="crd-h">T&eacute;cnico Asignado</div>
        <div class="crd-b">
          <div class="crd-r"><div class="crd-lb">T&eacute;cnico</div><div class="crd-v">{{ $ticket->assignedTo->name ?? 'Sin asignar' }}</div></div>
          <div class="crd-r"><div class="crd-lb">Correo Institucional</div><div class="crd-v">{{ $ticket->assignedTo->email ?? 'N/A' }}</div></div>
          <div class="crd-r"><div class="crd-lb">Fecha de Asignaci&oacute;n</div><div class="crd-v">{{ $ticket->fecha_asignacion ? \Carbon\Carbon::parse($ticket->fecha_asignacion)->format('d/m/Y h:i A') : 'Sin asignar' }}</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ========== DESCRIPCION ========== -->
<div class="sec">
  <div class="sec-t">Descripci&oacute;n del Problema</div>
  <div class="desc">{!! nl2br(e($ticket->descripcion ?? 'Sin descripci&oacute;n')) !!}</div>
</div>

<!-- ========== EVIDENCIAS ========== -->
@if($evidencias->count() > 0)
<div class="sec">
  <div class="sec-t">Evidencias Adjuntas ({{ $evidencias->count() }})</div>
  <table class="dtbl">
    <thead><tr><th style="width:5%">#</th><th style="width:35%">Archivo</th><th style="width:25%">Tipo</th><th style="width:15%">Tama&ntilde;o</th><th style="width:20%">Fecha</th></tr></thead>
    <tbody>
      @foreach($evidencias as $i => $ev)
      <tr><td>{{ $i+1 }}</td><td>{{ $ev->nombre_original ?? basename($ev->ruta ?? 'archivo') }}</td><td>{{ $ev->tipo ?? 'N/A' }}</td><td>{{ $ev->tamano ? round($ev->tamano/1024,1).' KB' : 'N/A' }}</td><td>{{ $ev->created_at ? $ev->created_at->format('d/m/Y') : 'N/A' }}</td></tr>
      @endforeach
    </tbody>
  </table>
</div>
@endif

<!-- ========== RESUMEN RAPIDO ========== -->
<div class="sec">
  <div class="sec-t">Resumen R&aacute;pido</div>
  <div class="srow">
    <div class="sc">
      <div class="sc-lb">Tiempo</div>
      <div class="sc-v">@if($ticket->fecha_cierre && $ticket->created_at){{ $ticket->created_at->diff(\Carbon\Carbon::parse($ticket->fecha_cierre))->format('%dh %Im') }}@else<span style="font-size:10px">En curso</span>@endif</div>
    </div>
    <div class="sc">
      <div class="sc-lb">Comentarios</div>
      <div class="sc-v">{{ $ticket->respuestas->count() }}</div>
    </div>
    <div class="sc">
      <div class="sc-lb">Archivos</div>
      <div class="sc-v">{{ $evidencias->count() }}</div>
    </div>
    <div class="sc">
      <div class="sc-lb">&Uacute;ltima Actualizaci&oacute;n</div>
      <div class="sc-vs">{{ $ticket->updated_at ? $ticket->updated_at->format('d/m/Y') : 'N/A' }}</div>
    </div>
  </div>
</div>

<!-- ========== HISTORIAL (tabla) ========== -->
<div class="sec">
  <div class="sec-t">Historial del Ticket</div>
  @if($historial->count() > 0)
  <table class="dtbl">
    <thead><tr><th style="width:16%">Fecha</th><th style="width:10%">Hora</th><th style="width:18%">Acci&oacute;n</th><th style="width:36%">Descripci&oacute;n</th><th style="width:20%">Usuario</th></tr></thead>
    <tbody>
      @foreach($historial as $reg)
      <tr><td>{{ $reg->created_at ? $reg->created_at->format('d/m/Y') : 'N/A' }}</td><td>{{ $reg->created_at ? $reg->created_at->format('h:i A') : 'N/A' }}</td><td>{{ $reg->tipo_cambio ?? 'N/A' }}</td><td>{{ $reg->comentario ?? 'N/A' }}</td><td>{{ $reg->usuario->name ?? 'Sistema' }}</td></tr>
      @endforeach
    </tbody>
  </table>
  @else
  <div class="desc" style="text-align:center;color:#94a3b8;font-size:8px">No hay registros en el historial</div>
  @endif
</div>

<!-- ========== RESULTADO ========== -->
<div class="sec">
  <div class="sec-t">Resultado de la Atenci&oacute;n</div>
  <div class="res">
    <div class="res-t">Soluci&oacute;n Registrada</div>
    <div class="res-tx">{{ $ticket->resultado ?? 'El ticket se encuentra en proceso de atenci&oacute;n por parte del t&eacute;cnico asignado.' }}</div>
  </div>
</div>

<!-- ========== FIRMAS ========== -->
<div class="sig-row">
  <div class="sig-c"><div class="sig-ln"><div class="sig-nm">{{ $ticket->createdBy->name ?? 'Solicitante' }}</div><div class="sig-rl">&Aacute;rea Solicitante</div></div></div>
  <div class="sig-c"><div class="sig-ln"><div class="sig-nm">{{ $ticket->assignedTo->name ?? 'T&eacute;cnico' }}</div><div class="sig-rl">T&eacute;cnico Responsable</div></div></div>
  <div class="sig-c"><div class="sig-ln"><div class="sig-nm">OTIC</div><div class="sig-rl">Jefe de OTIC</div></div></div>
</div>

<!-- ========== FOOTER ========== -->
<div class="ftr">
  <div class="ftr-l"><div class="ftr-t"><strong>Municipalidad Provincial de Casma</strong><br/>Sistema de Mesa de Ayuda &mdash; OTIC</div></div>
  <div class="ftr-r"><div class="ftr-t">{{ $generatedAt }}<br/>Generado por: {{ $generatedBy }}<br/>P&aacute;gina 1 de 1</div></div>
</div>

</div>
</body>
</html>
