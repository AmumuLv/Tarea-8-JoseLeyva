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
.hdr-area { font-size: 16px; font-weight: bold; color: #1e3a8a; }
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
.bg-activo { background: #dcfce7; color: #166534; }
.bg-inactivo { background: #fee2e2; color: #991b1b; }
.bg-operativo { background: #dcfce7; color: #166534; }
.bg-mantenimiento { background: #fef3c7; color: #92400e; }

/* DESC */
.desc { border: 1px solid #e2e8f0; background: #f8fafc; padding: 8px 10px; font-size: 9px; color: #334155; line-height: 1.5; }

/* SUMMARY */
.srow { overflow: hidden; margin-bottom: 6px; }
.srow::after { content: ""; display: table; clear: both; }
.sc { float: left; width: 23.5%; margin-right: 2%; text-align: center; background: #eff6ff; border: 1px solid #bfdbfe; padding: 7px 3px; }
.sc:last-child { margin-right: 0; }
.sc-lb { font-size: 7px; color: #3b82f6; text-transform: uppercase; font-weight: 700; letter-spacing: 0.2px; }
.sc-v { font-size: 15px; font-weight: bold; color: #1e3a8a; margin-top: 2px; }

/* TABLE */
.dtbl { width: 100%; border-collapse: collapse; font-size: 8px; }
.dtbl th { background: #1e3a8a; color: #fff; padding: 5px 7px; text-align: left; font-weight: 600; font-size: 7px; text-transform: uppercase; letter-spacing: 0.2px; }
.dtbl td { padding: 5px 7px; border-bottom: 1px solid #e2e8f0; }
.dtbl tr:nth-child(even) td { background: #f8fafc; }

/* SIG */
.sig-row { overflow: hidden; margin-top: 16px; }
.sig-row::after { content: ""; display: table; clear: both; }
.sig-c { float: left; width: 46%; margin-right: 8%; text-align: center; }
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
    <div class="hdr-area">{{ $area->nombre }}</div>
    <div class="hdr-fecha">{{ $generatedAt }}</div>
  </div>
</div>

<!-- ========== TITLE ========== -->
<div class="titulo">
  <h1>Reporte de &Aacute;rea</h1>
  <p>Documento generado autom&aacute;ticamente por el Sistema de Mesa de Ayuda</p>
</div>

@php
  $estArea = strtolower($area->estado) === 'activo' ? ['bg-activo', 'Activo'] : ['bg-inactivo', 'Inactivo'];
  $estTicketMap = [
    'abierto' => ['bg-abierto', 'Abierto'],
    'en_proceso' => ['bg-en_proceso', 'En Proceso'],
    'en_espera' => ['bg-en_espera', 'En Espera'],
    'asignado' => ['bg-asignado', 'Asignado'],
    'cerrado' => ['bg-cerrado', 'Cerrado'],
    'cancelado' => ['bg-cancelado', 'Cancelado'],
  ];
  $prioMap = [
    'critica' => ['bg-critico', 'Cr&iacute;tica'],
    'alta' => ['bg-alta', 'Alta'],
    'media' => ['bg-media', 'Media'],
    'baja' => ['bg-baja', 'Baja'],
  ];
  $estBienMap = [
    'operativo' => ['bg-operativo', 'Operativo'],
    'mantenimiento' => ['bg-mantenimiento', 'Mantenimiento'],
    'inactivo' => ['bg-inactivo', 'Inactivo'],
    'baja' => ['bg-baja', 'Baja'],
  ];
  $nombreUsuario = fn ($u) => $u ? trim(($u->full_name ?: $u->name) ?? '') : '';
@endphp

<!-- ========== INFORMACION GENERAL ========== -->
<div class="sec">
  <div class="sec-t">Informaci&oacute;n General</div>
  <div class="row">
    <div class="c4">
      <div class="crd"><div class="crd-h">Estado</div><div class="crd-b"><span class="bg {{ $estArea[0] }}">{{ $estArea[1] }}</span></div></div>
    </div>
    <div class="c4">
      <div class="crd"><div class="crd-h">Correo Institucional</div><div class="crd-b"><div class="crd-v">{{ $area->correo ?: 'N/A' }}</div></div></div>
    </div>
    <div class="c4">
      <div class="crd"><div class="crd-h">Responsable Actual</div><div class="crd-b"><div class="crd-v">{{ $nombreUsuario($responsable) ?: 'Sin asignar' }}</div></div></div>
    </div>
    <div class="c4">
      <div class="crd"><div class="crd-h">Fecha de Creaci&oacute;n</div><div class="crd-b"><div class="crd-v">{{ $area->created_at ? $area->created_at->format('d/m/Y') : 'N/A' }}</div></div></div>
    </div>
  </div>
  @if($responsableAsignacion && ($responsableAsignacion->cargo || $responsableAsignacion->fecha_inicio))
  <div class="row">
    <div class="c3">
      <div class="crd"><div class="crd-h">Cargo del Responsable</div><div class="crd-b"><div class="crd-v">{{ $responsableAsignacion->cargo ?: 'Sin cargo' }}</div></div></div>
    </div>
    <div class="c3">
      <div class="crd"><div class="crd-h">Inicio de Designaci&oacute;n</div><div class="crd-b"><div class="crd-v">{{ $responsableAsignacion->fecha_inicio ? \Carbon\Carbon::parse($responsableAsignacion->fecha_inicio)->format('d/m/Y') : 'N/A' }}</div></div></div>
    </div>
    <div class="c3">
      <div class="crd"><div class="crd-h">Tipo de Designaci&oacute;n</div><div class="crd-b"><div class="crd-v">{{ $responsableAsignacion->tipo_designacion ?: 'N/A' }}</div></div></div>
    </div>
  </div>
  @endif
  @if($area->descripcion)
  <div class="desc">{!! nl2br(e($area->descripcion)) !!}</div>
  @endif
</div>

<!-- ========== RESUMEN ========== -->
<div class="sec">
  <div class="sec-t">Resumen R&aacute;pido</div>
  <div class="srow">
    <div class="sc"><div class="sc-lb">Tickets Totales</div><div class="sc-v">{{ $ticketStats['total'] }}</div></div>
    <div class="sc"><div class="sc-lb">Tickets Activos</div><div class="sc-v">{{ $ticketStats['activos'] }}</div></div>
    <div class="sc"><div class="sc-lb">Tickets Cerrados</div><div class="sc-v">{{ $ticketStats['cerrados'] }}</div></div>
    <div class="sc"><div class="sc-lb">Cancelados</div><div class="sc-v">{{ $ticketStats['cancelados'] }}</div></div>
  </div>
  <div class="srow">
    <div class="sc"><div class="sc-lb">Bienes Totales</div><div class="sc-v">{{ $bienStats['total'] }}</div></div>
    <div class="sc"><div class="sc-lb">Operativos</div><div class="sc-v">{{ $bienStats['operativos'] }}</div></div>
    <div class="sc"><div class="sc-lb">En Mantenimiento</div><div class="sc-v">{{ $bienStats['mantenimiento'] }}</div></div>
    <div class="sc"><div class="sc-lb">Fuera de Servicio</div><div class="sc-v">{{ $bienStats['fuera'] }}</div></div>
  </div>
</div>

<!-- ========== TICKETS ASOCIADOS ========== -->
<div class="sec">
  <div class="sec-t">Tickets Asociados ({{ $tickets->count() }})</div>
  @if($tickets->count() > 0)
  <table class="dtbl">
    <thead><tr><th style="width:15%">N&uacute;mero</th><th style="width:33%">T&iacute;tulo</th><th style="width:13%">Prioridad</th><th style="width:14%">Estado</th><th style="width:13%">Fecha</th><th style="width:12%">T&eacute;cnico</th></tr></thead>
    <tbody>
      @foreach($tickets as $t)
      @php
        $est = $estTicketMap[strtolower($t->estado)] ?? ['bg-abierto', ucfirst($t->estado)];
        $pr = $prioMap[strtolower($t->prioridad)] ?? ['bg-media', ucfirst($t->prioridad)];
        $tecnico = $t->assignedTo ? ($nombreUsuario($t->assignedTo) ?: 'Sin asignar') : 'Sin asignar';
      @endphp
      <tr>
        <td>{{ $t->numero }}</td>
        <td>{{ $t->titulo }}</td>
        <td><span class="bg {{ $pr[0] }}">{{ $pr[1] }}</span></td>
        <td><span class="bg {{ $est[0] }}">{{ $est[1] }}</span></td>
        <td>{{ $t->created_at ? $t->created_at->format('d/m/Y') : 'N/A' }}</td>
        <td>{{ $tecnico }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @else
  <div class="desc" style="text-align:center;color:#94a3b8;font-size:8px">Sin tickets registrados</div>
  @endif
</div>

<!-- ========== EQUIPOS ASIGNADOS ========== -->
<div class="sec">
  <div class="sec-t">Equipos Asignados ({{ $bienes->count() }})</div>
  @if($bienes->count() > 0)
  <table class="dtbl">
    <thead><tr><th style="width:17%">C&oacute;digo</th><th style="width:20%">Tipo</th><th style="width:26%">Marca / Modelo</th><th style="width:17%">Estado</th><th style="width:20%">Sede</th></tr></thead>
    <tbody>
      @foreach($bienes as $b)
      @php
        $estB = $estBienMap[strtolower($b->estado)] ?? ['bg-operativo', ucfirst($b->estado)];
      @endphp
      <tr>
        <td><strong>{{ $b->codigo }}</strong></td>
        <td>{{ $b->tipoBien->nombre ?? 'N/A' }}</td>
        <td>{{ trim(($b->marca ?: '') . ' ' . ($b->modelo ?: '')) ?: 'N/A' }}</td>
        <td><span class="bg {{ $estB[0] }}">{{ $estB[1] }}</span></td>
        <td>{{ $b->sede->nombre ?? 'N/A' }}{{ $b->ubicacion ? ' &middot; ' . $b->ubicacion : '' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @else
  <div class="desc" style="text-align:center;color:#94a3b8;font-size:8px">Sin equipos asignados</div>
  @endif
</div>

<!-- ========== HISTORIAL RESPONSABLES ========== -->
@php $historial = $area->historialResponsables->filter(fn ($h) => $h->usuario); @endphp
<div class="sec">
  <div class="sec-t">Historial de Responsables ({{ $historial->count() }})</div>
  @if($historial->count() > 0)
  <table class="dtbl">
    <thead><tr><th style="width:32%">Responsable</th><th style="width:26%">Cargo</th><th style="width:16%">Inicio</th><th style="width:16%">Fin</th><th style="width:10%">Estado</th></tr></thead>
    <tbody>
      @foreach($historial as $h)
      <tr>
        <td><strong>{{ $nombreUsuario($h->usuario) ?: 'N/A' }}</strong></td>
        <td>{{ $h->cargo ?: 'N/A' }}</td>
        <td>{{ $h->fecha_inicio ? \Carbon\Carbon::parse($h->fecha_inicio)->format('d/m/Y') : 'N/A' }}</td>
        <td>{{ $h->fecha_fin ? \Carbon\Carbon::parse($h->fecha_fin)->format('d/m/Y') : '—' }}</td>
        <td><span class="bg {{ $h->estado_asignacion === 'activo' ? 'bg-activo' : 'bg-baja' }}">{{ $h->estado_asignacion === 'activo' ? 'Actual' : 'Finalizado' }}</span></td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @else
  <div class="desc" style="text-align:center;color:#94a3b8;font-size:8px">Sin registros de responsables</div>
  @endif
</div>

<!-- ========== FIRMAS ========== -->
<div class="sig-row">
  <div class="sig-c"><div class="sig-ln"><div class="sig-nm">{{ $nombreUsuario($responsable) ?: 'Por designar' }}</div><div class="sig-rl">Responsable del &Aacute;rea</div></div></div>
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
