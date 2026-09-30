<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes
    Route::post('/auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login'])
        ->middleware('throttle:login');
    Route::get('/settings', [\App\Http\Controllers\Api\SettingsController::class, 'index']);

    // Protected routes
    Route::prefix('auth')->middleware('jwt')->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
        Route::post('/refresh', [\App\Http\Controllers\Api\AuthController::class, 'refresh']);
        Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    });

    // Protected API routes
    Route::middleware(['jwt', 'throttle:api'])->group(function () {

        // Usuarios — specific routes BEFORE resource
        Route::get('usuarios/tecnicos', [\App\Http\Controllers\Api\UsuarioController::class, 'tecnicos'])
            ->middleware('permission:ver_usuarios');
        Route::apiResource('usuarios', \App\Http\Controllers\Api\UsuarioController::class)
            ->middleware('permission:ver_usuarios');
        Route::put('usuarios/{id}/estado', [\App\Http\Controllers\Api\UsuarioController::class, 'toggleEstado'])
            ->middleware('permission:editar_usuario');

        // Cargos
        Route::get('cargos/all', [\App\Http\Controllers\Api\CargoController::class, 'all'])
            ->middleware('permission:ver_cargos');
        Route::get('cargos', [\App\Http\Controllers\Api\CargoController::class, 'index'])
            ->middleware('permission:ver_cargos');
        Route::post('cargos', [\App\Http\Controllers\Api\CargoController::class, 'store'])
            ->middleware('permission:crear_cargo');
        Route::get('cargos/{id}', [\App\Http\Controllers\Api\CargoController::class, 'show'])
            ->middleware('permission:ver_cargos');
        Route::put('cargos/{id}', [\App\Http\Controllers\Api\CargoController::class, 'update'])
            ->middleware('permission:editar_cargo');
        Route::delete('cargos/{id}', [\App\Http\Controllers\Api\CargoController::class, 'destroy'])
            ->middleware('permission:eliminar_cargo');

        // Designaciones
        Route::get('designaciones/disponibles/areas', [\App\Http\Controllers\Api\DesignacionController::class, 'areasDisponibles'])
            ->middleware('permission:ver_designaciones');
        Route::get('designaciones/disponibles/usuarios', [\App\Http\Controllers\Api\DesignacionController::class, 'usuariosDisponibles'])
            ->middleware('permission:ver_designaciones');
        Route::get('designaciones/disponibles/cargos', [\App\Http\Controllers\Api\DesignacionController::class, 'cargosDisponibles'])
            ->middleware('permission:ver_designaciones');
        Route::put('designaciones/{id}/finalizar', [\App\Http\Controllers\Api\DesignacionController::class, 'finalizar'])
            ->middleware('permission:editar_designacion');
        Route::put('designaciones/{id}', [\App\Http\Controllers\Api\DesignacionController::class, 'update'])
            ->middleware('permission:editar_designacion');
        Route::get('designaciones/historial/{areaId}', [\App\Http\Controllers\Api\DesignacionController::class, 'historial'])
            ->middleware('permission:ver_designaciones');
        Route::get('designaciones/historial-personal/{usuarioId}', [\App\Http\Controllers\Api\DesignacionController::class, 'historialPersonal'])
            ->middleware('permission:ver_designaciones');
        Route::apiResource('designaciones', \App\Http\Controllers\Api\DesignacionController::class)->except(['update'])
            ->middleware('permission:ver_designaciones');

        // Areas
        Route::get('areas/stats', [\App\Http\Controllers\Api\AreaController::class, 'stats'])
            ->middleware('permission:ver_areas');
        Route::get('areas', [\App\Http\Controllers\Api\AreaController::class, 'index'])
            ->middleware('permission:ver_areas,ver_bienes');
        Route::get('areas/{id}/pdf', [\App\Http\Controllers\Api\AreaPdfController::class, 'generate'])
            ->middleware('permission:ver_areas');
        Route::apiResource('areas', \App\Http\Controllers\Api\AreaController::class)->except(['index'])
            ->middleware('permission:ver_areas');

        // Sedes
        Route::get('sedes', [\App\Http\Controllers\Api\SedeController::class, 'index'])
            ->middleware('permission:ver_sedes,ver_bienes');
        Route::apiResource('sedes', \App\Http\Controllers\Api\SedeController::class)->except(['index'])
            ->middleware('permission:ver_sedes');

        // Tecnicos de Mesa de Ayuda
        Route::get('tecnicos/all', [\App\Http\Controllers\Api\TecnicoController::class, 'all'])
            ->middleware('permission:ver_tecnicos');
        Route::get('tecnicos/stats', [\App\Http\Controllers\Api\TecnicoController::class, 'stats'])
            ->middleware('permission:ver_tecnicos');
        Route::get('tecnicos/{id}/historial', [\App\Http\Controllers\Api\TecnicoController::class, 'historial'])
            ->middleware('permission:ver_tecnicos');
        Route::get('tecnicos/{id}/stats-detalle', [\App\Http\Controllers\Api\TecnicoController::class, 'statsDetalle'])
            ->middleware('permission:ver_tecnicos');
        Route::put('tecnicos/{id}/estado', [\App\Http\Controllers\Api\TecnicoController::class, 'toggleEstado'])
            ->middleware('permission:editar_tecnico');
        Route::put('tecnicos/{id}/reset-password', [\App\Http\Controllers\Api\TecnicoController::class, 'resetPassword'])
            ->middleware('permission:editar_tecnico');
        Route::apiResource('tecnicos', \App\Http\Controllers\Api\TecnicoController::class)
            ->middleware('permission:ver_tecnicos');

        // Tickets
        Route::get('tickets/stats', [\App\Http\Controllers\Api\TicketController::class, 'stats'])
            ->middleware('permission:ver_mis_tickets,ver_todos_los_tickets,ver_tickets_asignados');
        Route::apiResource('tickets', \App\Http\Controllers\Api\TicketController::class)->except(['destroy'])
            ->middleware('permission:ver_mis_tickets,ver_todos_los_tickets,ver_tickets_asignados');
        Route::put('tickets/{id}/estado', [\App\Http\Controllers\Api\TicketController::class, 'cambiarEstado'])
            ->middleware('permission:cambiar_estado');
        Route::put('tickets/{id}/asignar', [\App\Http\Controllers\Api\TicketController::class, 'asignarTecnico'])
            ->middleware('permission:asignar_tecnico');
        Route::get('tickets/{id}/pdf', [\App\Http\Controllers\Api\TicketPdfController::class, 'generate'])
            ->middleware('permission:ver_ticket_pdf');
        Route::get('tickets/{id}/historial', [\App\Http\Controllers\Api\TicketController::class, 'historial'])
            ->middleware('permission:ver_historial');
        Route::post('tickets/{id}/evidencia', [\App\Http\Controllers\Api\TicketController::class, 'uploadEvidencia'])
            ->middleware('permission:subir_evidencia');
        Route::delete('tickets/{ticketId}/evidencia/{evidenciaId}', [\App\Http\Controllers\Api\TicketController::class, 'deleteEvidencia'])
            ->middleware('permission:eliminar_evidencia');

        Route::get('tickets/{ticketId}/respuestas', [\App\Http\Controllers\Api\RespuestaController::class, 'index'])
            ->middleware('permission:agregar_respuesta,ver_mis_tickets');
        Route::post('tickets/{ticketId}/respuestas', [\App\Http\Controllers\Api\RespuestaController::class, 'store'])
            ->middleware('permission:agregar_respuesta');

        // Dashboard
        Route::get('dashboard/estadisticas', [\App\Http\Controllers\Api\DashboardController::class, 'estadisticas'])
            ->middleware('permission:ver_estadisticas');
        Route::get('dashboard/recientes', [\App\Http\Controllers\Api\DashboardController::class, 'ticketsRecientes'])
            ->middleware('permission:ver_estadisticas');

        // Roles y Permisos
        Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index'])
            ->middleware('permission:ver_usuarios');
        Route::get('permisos', [\App\Http\Controllers\Api\PermisoController::class, 'index'])
            ->middleware('permission:ver_usuarios');

        // Auditoria
        Route::get('auditoria', [\App\Http\Controllers\Api\AuditController::class, 'index'])
            ->middleware('permission:ver_auditoria');

        // DNI Lookup
        Route::post('dni/lookup', [\App\Http\Controllers\Api\DniController::class, 'lookup'])
            ->middleware('permission:crear_usuario,crear_tecnico');

        // Settings
        Route::put('settings', [\App\Http\Controllers\Api\SettingsController::class, 'update'])
            ->middleware('permission:configurar_sistema');

        // Area Profile
        Route::get('area-profile', [\App\Http\Controllers\Api\AreaProfileController::class, 'profile'])
            ->middleware('permission:ver_perfil_area');
        Route::put('area-profile/password', [\App\Http\Controllers\Api\AreaProfileController::class, 'changePassword'])
            ->middleware('permission:cambiar_password_area');

        // Tipos de Bienes
        Route::get('tipos-bienes/all', [\App\Http\Controllers\Api\TipoBienController::class, 'all'])
            ->middleware('permission:ver_bienes');
        Route::apiResource('tipos-bienes', \App\Http\Controllers\Api\TipoBienController::class)->except(['show'])
            ->middleware('permission:ver_bienes');

        // Bienes
        Route::get('bienes/stats', [\App\Http\Controllers\Api\BienController::class, 'stats'])
            ->middleware('permission:ver_bienes');
        Route::get('bienes/por-area', [\App\Http\Controllers\Api\BienController::class, 'porArea'])
            ->middleware('permission:ver_bienes');
        Route::put('bienes/{id}/estado', [\App\Http\Controllers\Api\BienController::class, 'cambiarEstado'])
            ->middleware('permission:editar_bien');
        Route::get('bienes/{id}/historial', [\App\Http\Controllers\Api\BienController::class, 'historial'])
            ->middleware('permission:ver_bienes');
        Route::get('bienes/{bienId}/mantenimientos', [\App\Http\Controllers\Api\BienController::class, 'indexMantenimientos'])
            ->middleware('permission:ver_bienes');
        Route::post('bienes/{bienId}/mantenimientos', [\App\Http\Controllers\Api\BienController::class, 'storeMantenimiento'])
            ->middleware('permission:gestionar_bienes');
        Route::apiResource('bienes', \App\Http\Controllers\Api\BienController::class)
            ->middleware('permission:ver_bienes');
    });
});
